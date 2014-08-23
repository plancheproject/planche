Ext.define('Planche.lib.QueryParser', {
	constructor : function(engine){

		this.engine = engine;
		
		this.type = Planche.lib.QueryTokenType.get();

		this.isNotSelectQueryKeyword = ["UPDATE", "CREATE", "DELETE", "INSERT", "ALTER"];

		this.defaultLimit	= 100;
		this.quotes			= ['\'', '\"'];
		this.openComments	= ['#', '-- ', '/*']; 
		this.closeComments	= ['\n', '\n', '*/'];
		this.boundaries		= [
								'`', '~', '!', '@', '#', '$', '%', '^', '&', '*', '()', '(', ')', '+', '-',
								'=', '\\', '[', ']', '{', '}', ';', ':', '<', '>', ',', '.', '/', '?'
							  ];
		this.comparison		= ['=', '<=', '>=', '!=', '<', '>'];
		
		var boundaries		= this.addSlashes(this.boundaries).join("|");
        
		this.regexpWhiteSpace		= /^\s+/g;
		this.regexpTrim				= /(^\s*)|(\s*$)/gi;
		this.regexpIsNotSelectQuery	= new RegExp('^('+this.isNotSelectQueryKeyword.join("|")+')', "gi");
		this.regexpBoundaries		= new RegExp('^('+boundaries+')', "g");
		this.regexpSplit			= new RegExp('('+boundaries+'|$|\\s)', "g");
		this.regexpJoin				= new RegExp('^('+this.engine.getJoins().join("|")+')', "gi");
		this.regexpLimit			= new RegExp('^'+this.engine.getRegexpLimit(), "gi");
		
		this.regexpDelimiter		= /^;/g;
		this.regexpFunctions		= new RegExp('^('+this.engine.getFunctions().join("|")+')\\((.*?[\\\']){0,}.*?\\)', "gi");
		this.regexpReservedWords	= new RegExp('^('+this.engine.getReservedWords().join("|")+')($|\\s|'+boundaries+')', "i");
		this.regexpComparison		= new RegExp('^('+this.addSlashes(this.comparison).join("|")+')', "g");
		
		this.regexpQuotedString		= /^([`\\"'])( (\\\\{2})*|(.*?[^\\\\](\\\\{2})*) )\\1/;
		this.regexpTable			= /^([`]?([a-zA-Z0-9_$#]+)[`]?[.@])?[`]?([a-zA-Z0-9_$#]+)[`]?/;
		this.regexpNumber			= /^[0-9]+/;

		this.regexpAlgorithm		= /^ALGORITHM(\s+)?=(\s+)?[a-zA-Z]+/gi;
		this.regexpDefiner			= /^DEFINER(\s+)?=(\s+)?([`\'\"]?)(.+?)\3@?([`\'\"]?)(.+?)\5/gi;

		this.space	= ' ';
		this.newln	= '\n';
		this.tab	= '\t';
	},

	parse : function(string, delimiter){

		if(delimiter){

			this.regexpDelimiter = new RegExp("^"+this.addSlashes(delimiter), 'g');
		}

		var tokens, queries, i;
		
		tokens = this.tokenize(string);
		queries	= this.splitQuery(tokens);		
		queries	= this.parseQuery(queries);
		
		for(i in queries){

			queries[i] = Ext.create('Planche.lib.Query', queries[i]);
		}

		return queries;
	},

	tokenize : function(string){

		var len = string.length;
		var tokens = [], token;
		this.pass_by_from = false;
		
		while(len){

			token = this.getNextToken(string);
			string = string.substring(token.value.length);			

			//break infinity loop
			if(len == string.length){

				break;
			}
			else {

				len = string.length;
			}

			tokens.push(token);
		}

		return tokens;
	},

	getNextToken : function(string){

		var token = {}, matches;

		if(matches = string.match(this.regexpWhiteSpace)){

			token.type = this.type.SPACE;
			token.value = matches[0];
			return token;
		}		

		var cmts = this.openComments, cmt, i, inCmt = -1, pos, last;
		for(i in cmts){

			cmt = cmts[i];

			if(string.substring(0, cmt.length) == cmt){

				inCmt = i;
				break;
			}
		}

		if(inCmt > -1){

			token.type = this.type.COMMENT;
			pos = string.indexOf(this.closeComments[inCmt]);
			if(pos > -1){

				token.value = string.substring(0, pos + this.closeComments[inCmt].length);
			}
			else {

				token.value = string.substring(0);
			}

			return token;
		}

		if((pos = this.quotes.indexOf(string[0])) > -1){

			token.type = this.type.QUOTE;
			last = string.indexOf(this.quotes[pos], 1);			
			if(last > -1){			

				token.value = string.substring(0, last + 1);
			}
			else {

				token.value = string.substring(0);	
			}

			return token;
		}

		if(matches = string.match(this.regexpDelimiter)){

			token.type = this.type.QUERY_END;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(this.regexpAlgorithm)){

			token.type = this.type.ALGORITHM;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(this.regexpDefiner)){

			token.type = this.type.DEFINER;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(this.regexpComparison)){

			token.type = this.type.COMPARISON;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(this.regexpJoin)){

			token.type = this.type.JOIN;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(this.regexpFunctions)){

			token.type = this.type.FUNCTION;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(this.regexpReservedWords)){

            var upper = matches[1].toUpperCase();

            if(['FROM', 'UPDATE', 'INSERT'].indexOf(upper) > -1){

                this.pass_by_from = true;
            }

			token.type = this.type.RESERVED_WORD;
			token.value = matches[1];
			return token;
		}
		
        if(this.pass_by_from == true){

            if(matches = string.match(this.regexpTable)){

                this.pass_by_from = false;

				token.type = this.type.TABLE;
				token.value = matches[0];
				return token;
            }
        }

		if(matches = string.match(this.regexpQuotedString)){

			token.type = this.type.QUOTED_STRING;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(this.regexpBoundaries)){

			token.type = this.type.BOUNDARY;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(this.regexpLimit)){

			token.type = this.type.LIMIT;
			token.value = matches[0];

			return token;
		}

		if(matches = string.match(/^DELIMITER\s([^\s]+)/i)){

			token.type = this.type.DELIMITER;
			token.value = matches[0];

			this.regexpDelimiter = new RegExp("^"+this.addSlashes(matches[1]), 'g');

			return token;
		}

        if(pos = string.search(this.regexpSplit)) {

            var value = string.substring(0, pos);

            if(matches = string.match(this.regexpNumber)){

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
	addSlashes : function(arr){
						
		if(typeof arr == 'string'){

			return Ext.Array.map(arr.split(''), function(item, idx){ return item.replace(/./g, '\\$&'); }).join('');
		}
		else {

			return Ext.Array.map(arr, function(item, idx){ return item.replace(/./g, '\\$&'); });
		}
	},
	setLineCursor : function(tokens){

		var i, j, token, type, word, line = 0, cursor = 0, move;

		for(i = 0 ; i < tokens.length ; i++){

			token = tokens[i];
			type = token.type;
			word = token.value;

			if(type == this.type.SPACE || type == this.type.LIMIT){
				
				for(j = 0 ; j < word.length ; j++){

					chr = word[j];
					if(chr == this.newln){

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

			token.line = [ line, cursor ];	
		}

		return tokens;
	},

	splitQuery : function(tokens){

		var queries = [], tmpTokens = [], raw = '', token, sline = [ 0, 0 ], eline = [ 0, 0 ];
		
		tokens = this.setLineCursor(tokens);
		level = 1;
		
		while(tokens.length){

			token = tokens.shift();			
			eline = token.line;

			// if(token.type == this.type.DELIMITER){

			// 	continue;
			// }

			tmpTokens.push(token);

			if(token.type != this.type.QUERY_END){

				raw += token.value;
			}

			if(token.type == this.type.QUERY_END){

				queries.push({raw : raw, sline : sline, eline : eline, tokens : tmpTokens});
				sline = token.line;
				tmpTokens = [];
				raw = '';
			}
		}

		if(raw.replace(/\s/g,"")){

			queries.push({raw : raw, sline : sline, eline : eline, tokens : tmpTokens});
		}

		return queries;
	},

	parseQuery : function(queries){

		var i, j, tokens, token, query, level, hasLimit, 
			value, type, matches, isSelectQuery, sql = '';
		
		for(i in queries){

			level = 1;
			hasLimit = false;
			query = queries[i];

			if(!query) return;

			query.start = 0;
			query.end = this.defaultLimit;

			isSelectQuery = false;
			sql = '';

			for(j = 0 ; j < query.tokens.length ; j++){

				token = query.tokens[j];				
				value = token.value;			
				type = token.type;

				if(type == this.type.BOUNDARY){

					if(value == "("){

						level++;
					}
					
					if(value == ")"){

						level--;
					}
				}

				if(isSelectQuery == true){

					if(value.match(this.regexpIsNotSelectQuery)){

						isSelectQuery = false;
					}
				}
				else {


					if(value.match(/^select/gi)){

						isSelectQuery = true;
					}
				}

				query.isSelectQuery = isSelectQuery;

				if(isSelectQuery == true && level == 1 && type == this.type.LIMIT){

					hasLimit = true;
					matches = value.replace(/\s+/g, '').match(/[0-9]+/g);
					if(matches.length == 2){

						query.start = parseInt(matches[0], 10);
						query.end = parseInt(matches[1], 10);
					}
					else {

						query.start = 0;
						query.end = parseInt(matches[0], 10);
					}
				}
				else {

					if(type != this.type.QUERY_END){

						sql += value;
					}
				}
			}

			if(isSelectQuery == true && hasLimit == false){

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