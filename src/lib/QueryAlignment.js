Ext.define('Planche.lib.QueryAlignment', function() {

    var type;

    var independent_newline = [
            'SELECT', 'WHERE', 'SET', 'ORDER BY', 'GROUP BY', 'VALUES',
            'HAVING', 'BEGIN', 'END', 'INSERT INTO', 'INSERT', 'UPDATE', 'DELETE FROM', 'DELETE', 'DROP TABLE', 'CREATE TABLE', 'ALTER TABLE',
            'NATURAL JOIN', 'INNER JOIN', 'LFET INNER JOIN', 'RIGHT INNER JOIN', 'LEFT OUTER JOIN',
            'LEFT JOIN', 'RIGHT OUTER JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'JOIN', 'FROM', 'ON DUPLICATE KEY UPDATE'
        ],
        independent_inline = [
            'AND', 'OR', 'XOR', 'END', ','
        ];

    return {
        requires : [
            'Planche.lib.QueryTokenType'
        ],
        singleton  : true,
        constructor: function(config) {

            this.callParent(arguments);

            type = Planche.lib.QueryTokenType.get();
        },

        equalLastChar: function(str, ch) {

            return str.slice(str.length - 1) === ch;
        },

        alignment: function(query) {

            var tokens = [];
            Ext.Array.each(query.getTokens(), function(token, idx) {

                //first remove spaces and new lines, whitespaces
                if (token.type == type.SPACE) {

                    return;
                }

                tokens.push(token);
            });

            var me = this,
                tmpStr = '',
                indentLevel = 1,
                prevToken = {
                    value: null,
                    type : null
                },
                countColumn = 0;

            Ext.Array.each(tokens, function(token, idx) {

                var tokenVal = token.value,
                    tokenValUCase = tokenVal.toUpperCase(),
                    tokenType = token.type,
                    nextToken = tokens[idx + 1] || {value: null, type: null},
                    nextTokenType = nextToken.type,
                    nextTokenVal = nextToken.value,
                    prevTokenType = prevToken.type,
                    prevTokenVal = prevToken.value;


                //if (tokenType === type.JOIN) {
                //
                //    tmpStr += (me.equalLastChar(tmpStr, '\n') ? '' : '\n') + (new Array(indentLevel).join("\t"));
                //
                //    if (nextToken.type === type.TABLE) {
                //
                //        tmpStr += tokenValUCase + " ";
                //        prevToken = token;
                //        return;
                //    }
                //
                //    tmpStr += tokenValUCase + "\n" + (new Array(indentLevel).join("\t"));
                //    prevToken = token;
                //    return;
                //}
                //

                if(independent_newline.indexOf(tokenValUCase) > -1){

                    if(indentLevel > 1 && prevTokenVal != '(') {

                        indentLevel--;
                    }

                    tmpStr += '\n'+(new Array(indentLevel).join("\t")) + tokenValUCase + '\n';

                    indentLevel++;

                    tmpStr += (new Array(indentLevel).join("\t"));

                    prevToken = token;

                    return;
                }

                if(independent_inline.indexOf(tokenValUCase) > -1){

                    tmpStr += '\n'+(new Array(indentLevel).join("\t")) + tokenValUCase + (tokenValUCase == ',' ? '' : ' ');
                    prevToken = token;
                    return;
                }

                if (tokenType === type.RESERVED_WORD) {

                    tmpStr += tokenValUCase + " ";
                    prevToken = token;
                    return;
                }

                if (tokenType == type.QUOTED_STRING || tokenType == type.BACKTICK_QUOTED_STRING) {

                    if (countColumn === -1) {

                        countColumn = 0;
                    }

                    if (countColumn > -1) {

                        countColumn++;
                    }

                    tmpStr += tokenVal;
                    prevToken = token;

                    return;
                }

                if (tokenType === type.BOUNDARY) {

                    if (tokenVal != ',') {

                        countColumn = -1;
                    }

                    if (tokenVal == '(') {

                        if (tokens[idx + 2]) {

                            if (tokens[idx + 2].value == ')') {

                                tmpStr += tokenVal;
                                prevToken = token;
                                return;
                            }
                        }

                        indentLevel++;
                        tmpStr += tokenVal + "\n" + (new Array(indentLevel).join("\t"));
                        prevToken = token;
                        return;
                    }

                    if (tokenVal == ')') {

                        if (tokens[idx - 2]) {

                            if (tokens[idx - 2].value == '(') {

                                tmpStr += tokenVal + " ";
                                prevToken = token;
                                return;
                            }
                        }

                        if(indentLevel > 1) {

                            indentLevel--;
                        }

                        tmpStr += "\n" + (new Array(indentLevel).join("\t"));

                        if (nextTokenVal == ',') {

                            tmpStr += tokenVal;
                            prevToken = token;
                            return;
                        }

                        tmpStr += tokenVal + " ";
                        prevToken = token;
                        return;
                    }

                    if (tokenVal == ',') {

                        if (prevTokenVal == ")") {

                            tmpStr += tokenVal + "\n" + (new Array(indentLevel).join("\t"));
                            prevToken = token;
                            return;
                        }

                        if (countColumn % 5 == 0 && countColumn > 0) {

                            //if (countColumn % 5 == 0){
                            //
                            //    ((2 - 1) * 5) + 1
                            //}

                            tmpStr += tokenVal + "\n" + (new Array(indentLevel).join("\t"));
                            prevToken = token;
                            return;
                        }

                        tmpStr += tokenVal + " ";
                        prevToken = token;
                        return;
                    }

                    if (nextTokenType === type.STRING) {

                        tmpStr += tokenVal;
                        prevToken = token;
                        return;
                    }

                    tmpStr += tokenVal + " ";
                    prevToken = token;
                    return;
                }

                if (tokenType === type.FUNCTION) {

                    if (nextTokenType === type.RESERVED_WORD) {

                        tmpStr += tokenValUCase + "\n" + (new Array(indentLevel).join("\t"));
                        prevToken = token;
                        return;
                    }

                    tmpStr += tokenValUCase + " ";
                    prevToken = token;
                    return;
                }

                if (tokenType == type.COMMENT) {

                    tmpStr += (me.equalLastChar(tmpStr, '\n') ? '' : '\n') + (new Array(indentLevel).join("\t"));

                    tmpStr += tokenVal;

                    if (tokenVal.slice(tokenVal.length - 2) == "*/") {

                        tmpStr += "\n" + (new Array(indentLevel).join("\t"));
                    }

                    prevToken = token;
                    return;
                }

                if (tokenType == type.DELIMITER) {

                    tmpStr += tokenVal;
                    tmpStr += '\n\n';
                    prevToken = token;
                    return;
                }

                if (nextTokenVal === ".") {

                    tmpStr += tokenVal;
                    prevToken = token;
                    return;
                }

                tmpStr += tokenVal + " ";
                prevToken = token;
            });

            return tmpStr;
        }
    };
});
