Ext.define('Planche.lib.QueryParser', {
    constructor: function(engine) {

        this.engine = engine;

        this.type = Planche.lib.QueryTokenType.get();

        this.defaultLimit = 100;
        this.openComments = ['#', '-- ', '/*'];
        this.closeComments = ['\n', '\n', '*/'];
        this.boundaries = [
            '`', '~', '!', '@', '#', '$', '%', '^', '&', '*', '()', '(', ')', '+', '-',
            '=', '\\', '[', ']', '{', '}', ';', ':', '<', '>', ',', '.', '/', '?'
        ];
        this.comparison = ['=', '<=', '>=', '!=', '<>', '<', '>'];

        var boundaries = this.addSlashes(this.boundaries).join("|");

        this.regexpWhiteSpace = new RegExp('^\\s+', 'g');
        this.regexpTrim = new RegExp('(^\\s*)|(\\s*$)', 'gi');
        this.regexpNotSelectQueries = new RegExp('^(' + this.engine.getNotSelectQueries().join("|") + ')', "gi");
        this.regexpBoundaries = new RegExp('^(' + boundaries + ')', "g");
        this.regexpSplit = new RegExp('(' + boundaries + '|$|\\s)', "g");
        this.regexpJoin = new RegExp('^(' + this.engine.getJoins().join("|") + ')', "gi");
        this.regexpLimit = new RegExp('^' + this.engine.getRegexpLimit(), "gi");

        this.regexpDelimiter = new RegExp('^;', 'g');
        this.regexpFunctions = new RegExp('^([a-zA-Z0-9_$.]+)\\(', "gi");
        this.regexpReservedWords = new RegExp('^(' + this.engine.getReservedWords().join("|") + ')($|\\s|' + boundaries + ')', "i");
        this.regexpComparison = new RegExp('^(' + this.addSlashes(this.comparison).join("|") + ')', "g");
        this.regexpFunctions = new RegExp('^([a-zA-Z0-9_$.]+)\\(', "gi");

        this.regexpBackTickQuotedString = /^\`(?:[^\`\\]|\\.)*\`/;
        this.regexpQuotedString = /^(\'(?:[^\'\\]|\\.)*\'|\"(?:[^\"\\]|\\.)*\")/;

        this.regexpReference = /(^[`]?[\w.]+[`]?\.[`]?[\w.]+[`]?)|(^[`]?[\w.]+[`]?)/;
        this.regexpNumber = /^[0-9]+/;

        this.regexpAlgorithm = /^ALGORITHM(\s+)?=(\s+)?[a-zA-Z]+/gi;
        this.regexpDefiner = /^DEFINER(\s+)?=(\s+)?([`\'\"]?)(.+?)\3@?([`\'\"]?)(.+?)\5/gi;

        this.space = ' ';
        this.newln = '\n';
        this.tab = '\t';
    },

    parse: function(string, delimiter) {

        if (delimiter) {

            this.regexpDelimiter = new RegExp("^" + this.addSlashes(delimiter), 'g');
        }

        var tokens, queries, i;

        tokens = this.tokenize(string);
        queries = this.splitQuery(tokens);
        queries = this.parseQuery(queries);

        for (i in queries) {

            queries[i] = Ext.create('Planche.lib.Query', queries[i]);
        }

        return queries;
    },

    tokenize: function(string) {

        var len = string.length;
        var tokens = [], token;
        this.detect = false;

        while (len) {

            token = this.getNextToken(string);
            string = string.substring(token.value.length);

            //break infinity loop
            if (len == string.length) {

                break;
            }
            else {

                len = string.length;
            }

            tokens.push(token);
        }

        return tokens;
    },

    getNextToken : function(string) {

        var token = {}, matches;

        if (matches = string.match(this.regexpWhiteSpace)) {

            token.type = this.type.SPACE;
            token.value = matches[0];
            return token;
        }

        var cmts = this.openComments, cmt, i, inCmt = -1, pos, last;
        for (i in cmts) {

            cmt = cmts[i];

            if (string.substring(0, cmt.length) == cmt) {

                inCmt = i;
                break;
            }
        }

        if (inCmt > -1) {

            token.type = this.type.COMMENT;
            pos = string.indexOf(this.closeComments[inCmt]);
            if (pos > -1) {

                token.value = string.substring(0, pos + this.closeComments[inCmt].length);
            }
            else {

                token.value = string.substring(0);
            }

            return token;
        }

        if (matches = string.match(this.regexpDelimiter)) {

            token.type = this.type.QUERY_END;
            token.value = matches[0];
            return token;
        }

        if (matches = string.match(this.regexpAlgorithm)) {

            token.type = this.type.ALGORITHM;
            token.value = matches[0];
            return token;
        }

        if (matches = string.match(this.regexpDefiner)) {

            token.type = this.type.DEFINER;
            token.value = matches[0];
            return token;
        }

        if (matches = string.match(this.regexpComparison)) {

            token.type = this.type.COMPARISON;
            token.value = matches[0];
            return token;
        }

        if (matches = string.match(this.regexpJoin)) {

            this.detect = true;

            token.type = this.type.JOIN;
            token.value = matches[0];
            return token;
        }

        if (matches = string.match(this.regexpFunctions)) {

            token.type = this.type.FUNCTION;

            var value = matches[0];

            string = string.substring(value.length);

            var len          = string.length,
                funcDepth    = 1,
                funcToken    = {},
                funcPos,
                me           = this,
                getNextToken = function(string) {

                    // console.log(string);

                    if (m = string.match(me.regexpWhiteSpace)) {

                        return m[0];
                    }

                    if (m = string.match(me.regexpFunctions)) {

                        funcDepth++;
                        return m[0];
                    }

                    if (m = string.match(me.regexpQuotedString)) {

                        return m[0];
                    }

                    if (m = string.match(me.regexpBoundaries)) {

                        if (m[0] == '(') {

                            funcDepth++;
                        }
                        else if (m[0] == ')') {

                            funcDepth--;
                        }

                        return m[0];
                    }

                    if (funcPos = string.search(me.regexpSplit)) {

                        if (m = string.match(me.regexpNumber)) {

                            return string.substring(0, funcPos);
                        }
                        else {

                            return string.substring(0, funcPos);
                        }
                    }
                    else {

                        return string;
                    }
                };

            while (len) {

                var funcToken = getNextToken(string);

                value += funcToken;

                string = string.substring(funcToken.length);

                //break infinity loop
                if (len == string.length) {

                    break;
                }
                else {

                    len = string.length;
                }

                if (funcDepth === 0) {

                    break;
                }
            }


            token.value = value;
            return token;
        }

        if (matches = string.match(this.regexpLimit)) {

            token.type = this.type.LIMIT;
            token.value = matches[0];

            return token;
        }

        if (matches = string.match(/^DELIMITER\s?([^\s]+)/i)) {

            token.type = this.type.DELIMITER;
            token.value = matches[0];

            this.regexpDelimiter = new RegExp("^" + this.addSlashes(matches[1]), 'g');

            return token;
        }

        if (matches = string.match(this.regexpReservedWords)) {

            this.detect = false;

            var upper = matches[1].toUpperCase();

            if (this.engine.getDetectKeywords().indexOf(upper) > -1) {

                this.detect = upper;
            }

            token.type = this.type.RESERVED_WORD;
            token.value = matches[1];
            return token;
        }

        if (this.detect) {

            if (matches = string.match(this.regexpReference)) {

                token.type = this.type[this.detect] || this.type.TABLE;
                token.value = matches[0];

                //console.log(matches);
                this.detect = false;

                return token;
            }
        }

        if (matches = string.match(this.regexpReference)) {

            token.type = this.type.REFERENCE;
            token.value = matches[0];

            return token;
        }

        if (matches = string.match(this.regexpBackTickQuotedString)) {

            token.type = this.type.BACKTICK_QUOTED_STRING;
            token.value = matches[0];
            return token;
        }

        if (matches = string.match(this.regexpQuotedString)) {

            token.type = this.type.QUOTED_STRING;
            token.value = matches[0];
            return token;
        }

        if (matches = string.match(this.regexpBoundaries)) {

            token.type = this.type.BOUNDARY;
            token.value = matches[0];
            return token;
        }

        if (pos = string.search(this.regexpSplit)) {

            var value = string.substring(0, pos);

            if (matches = string.match(this.regexpNumber)) {

                token.type = this.type.NUMBER;
                token.value = value;
                return token;
            }
            else {

                token.type = this.type.STRING;
                token.value = value;
                return token;
            }
        }
        else {

            var value = string;
        }

        token.type = this.type.STRING;
        token.value = value;

        return token;
    },
    addSlashes   : function(arr) {

        if (typeof arr == 'string') {

            return Ext.Array.map(arr.split(''), function(item, idx) {
                return item.replace(/./g, '\\$&');
            }).join('');
        }
        else {

            return Ext.Array.map(arr, function(item, idx) {
                return item.replace(/./g, '\\$&');
            });
        }
    },
    setLineCursor: function(tokens) {

        var i, j, token, type, word, line = 0, cursor = 0, move;

        for (i = 0 ; i < tokens.length ; i++) {

            token = tokens[i];
            type = token.type;
            word = token.value;

            token.sline = [line, cursor];

            if (type == this.type.SPACE || type == this.type.LIMIT) {

                for (j = 0 ; j < word.length ; j++) {

                    chr = word[j];
                    if (chr == this.newln) {

                        line++;
                        cursor = 0;
                    }
                    else {

                        cursor++;
                    }
                }
            }
            else {

                cursor += word.length;
            }

            token.eline = [line, cursor];
        }

        return tokens;
    },

    splitQuery: function(tokens) {

        var queries = [], tmpTokens = [], raw = '', token, delimiter = false, sline = [0, 0], eline = [0, 0];

        tokens = this.setLineCursor(tokens);
        level = 1;

        while (tokens.length) {

            token = tokens.shift();

            if (token.type == this.type.DELIMITER) {

                if (tmpTokens.length > 0 && Ext.String.trim(raw)) {

                    queries.push({raw: raw, sline: sline, eline: eline, tokens: tmpTokens, delimiter: false});
                }

                queries.push({
                    raw      : token.value,
                    sline    : token.sline,
                    eline    : token.eline,
                    tokens   : [token],
                    delimiter: true
                });

                sline = token.eline;
                tmpTokens = [];
                raw = '';
                continue;
            }

            if (token.type == this.type.QUERY_END) {

                tmpTokens.push(token);

                queries.push({raw: raw, sline: sline, eline: token.eline, tokens: tmpTokens, delimiter: false});

                sline = token.eline;
                tmpTokens = [];
                raw = '';
                continue;
            }

            tmpTokens.push(token);
            raw += token.value;
            eline = token.eline;
        }

        if (raw.replace(/\s/g, "")) {

            queries.push({raw: raw, sline: sline, eline: eline, tokens: tmpTokens});
        }

        return queries;
    },

    parseQuery: function(queries) {

        var i, j, tokens, token, query, level, hasLimit,
            value, type, matches, isSelectQuery, sql = '';

        for (i in queries) {

            level = 1;
            hasLimit = false;
            query = queries[i];

            if (!query) return;

            query.start = 0;
            query.end = this.defaultLimit;

            isSelectQuery = null;
            sql = '';

            for (j = 0 ; j < query.tokens.length ; j++) {

                token = query.tokens[j];
                value = token.value;
                type = token.type;

                if (type == this.type.DELIMITER) {

                    isSelectQuery = null;
                    sql += value;
                    continue;
                }

                if (type == this.type.BOUNDARY) {

                    if (value == "(") {

                        level++;
                    }

                    if (value == ")") {

                        level--;
                    }
                    sql += value;
                    continue;
                }

                if (isSelectQuery == null) {

                    if (value.match(this.regexpNotSelectQueries)) {

                        isSelectQuery = false;
                    }
                    else if (value.match(/^SELECT/gi)) {

                        isSelectQuery = true;
                    }

                    query.isSelectQuery = isSelectQuery;

                    sql += value;
                    continue;
                }

                if (isSelectQuery == true && level == 1 && type == this.type.LIMIT) {

                    hasLimit = true;
                    matches = value.replace(/\s+/g, '').match(/[0-9]+/g);
                    if (matches.length == 2) {

                        query.start = parseInt(matches[0], 10);
                        query.end = parseInt(matches[1], 10);
                    }
                    else {

                        query.start = 0;
                        query.end = parseInt(matches[0], 10);
                    }
                }
                else {

                    if (type != this.type.QUERY_END) {

                        sql += value;
                    }
                }
            }

            if (isSelectQuery == true && hasLimit == false) {

                hasLimit = true;
                query.start = 0;
                query.end = this.defaultLimit;
            }

            query.hasLimit = hasLimit;
            query.sql = sql;
        }

        return queries;
    }
});