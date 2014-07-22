Ext.define('Planche.lib.QueryParser', {
	constructor : function(engine){

		this.engine = engine;

		this.isNotSelectQueryKeyword = ["UPDATE", "CREATE", "DELETE", "INSERT", "ALTER"];

		this.defaultLimit	= 100;
		this.quotes			= ['\'', '\"'];
		this.openComments	= ['#', '-- ', '/*']; 
		this.closeComments	= ['\n', '\n', '*/'];
		
		this.regexpWhiteSpace		= /^\s+/g;
		this.regexpTrim				= /(^\s*)|(\s*$)/gi;
		this.regexpIsNotSelectQuery	= new RegExp('^('+this.isNotSelectQueryKeyword.join("|")+')', "gi");
		this.regexpBoundaries		= /^[`~\!@#\$%\^&\*\(\)\+\-\=\\\[\]\{\};\:\<\>,\.\/\?]/g;
		this.regexpSplit			= /[`~\!@#\$%\^&\*\(\)\+\-\=\\\[\]\{\};\:\<\>,\.\/\?]|\s/g;
		this.regexpDelimiter		= /^;/g;
		this.regexFunctions 		= new RegExp('^('+this.engine.getFunctions().join("|")+')', "gi");
		this.regexKeywords 			= new RegExp('^('+this.engine.getKeywords().join("|")+')', "gi");

		this.TYPE_STRING		= 0;
		this.TYPE_COMMENT		= 1;
		this.TYPE_SPACE			= 2;
		this.TYPE_TOP_LEVEL		= 3;
		this.TYPE_JOIN			= 4;
		this.TYPE_CONDITIONS	= 5;
		this.TYPE_FUNCTIONS		= 6;
		this.TYPE_BOUNDARIES	= 7;
		this.TYPE_QUOTE			= 8;
		this.TYPE_DELIMITER		= 9;
		this.TYPE_QUERY_END		= 10;
		this.TYPE_LIMIT 		= 11;

		
		this.space	= ' ';
		this.newln	= '\n';
		this.tab	= '\t';
	},

	parse : function(string, delimiter){

		if(delimiter){

			this.regexpDelimiter = new RegExp("^"+this.preg_quote(delimiter), 'g');
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

			token.type = this.TYPE_SPACE;
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

			token.type = this.TYPE_COMMENT;
			pos = string.indexOf(this.closeComments[inCmt]);
			if(pos > -1){

				token.value = string.substring(0, pos + cmt.length);
			}
			else {

				token.value = string.substring(0);
			}

			return token;
		}

		if((pos = this.quotes.indexOf(string[0])) > -1){

			token.type = this.TYPE_QUOTE;
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

			token.type = this.TYPE_QUERY_END;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(this.regexpBoundaries)){

			token.type = this.TYPE_BOUNDARIES;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(/^LIMIT\s+[0-9]+((\s+?,|,)?(\s+)?[0-9]+)/ig)){

			token.type = this.TYPE_LIMIT;
			token.value = matches[0];
			return token;
		}

		if(matches = string.match(/^DELIMITER\s([^\s]+)/i)){

			token.type = this.TYPE_DELIMITER;
			token.value = matches[0];
			this.regexpDelimiter = new RegExp("^"+this.preg_quote(matches[1]), 'g');
			return token;
		}

		pos = string.search(this.regexpSplit);
		
		token.type = this.TYPE_STRING;
		if(pos > 0) {

			token.value = string.substring(0, pos);
		}
		else {

			token.value = string;	
		}
		return token;	
	},

	preg_quote : function(str, delimiter) {

		return String(str).replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
	},

	setLineCursor : function(tokens){

		var i, j, token, type, word, line = 1, cursor = 0, move;

		for(i = 0 ; i < tokens.length ; i++){

			token = tokens[i];
			type = token.type;
			word = token.value;

			if(type == this.TYPE_SPACE || type == this.TYPE_LIMIT){
				
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

			token.line = parseFloat(line+"."+cursor);		
		}

		return tokens;
	},

	splitQuery : function(tokens){

		var queries = [], tmpTokens = [], raw = '', token, sline = 1.0, eline = 0;
		
		tokens = this.setLineCursor(tokens);
		level = 1;
		
		while(tokens.length){

			token = tokens.shift();			
			eline = token.line;

			if(token.type == this.TYPE_DELIMITER){

				continue;
			}

			tmpTokens.push(token);

			if(token.type != this.TYPE_QUERY_END){

				raw += token.value;
			}

			if(token.type == this.TYPE_QUERY_END){

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

				if(type == this.TYPE_BOUNDARIES){

					if(value == "("){

						level++;
					}
					
					if(value == ")"){

						level--;
					}
				}

				if(isSelectQuery == true){

					if(value.match(this.regexpIsNotSelectQuery)){
						console.log(value.match(this.regexpIsNotSelectQuery));
						isSelectQuery = false;
					}
				}
				else {


					if(value.match(/^select/gi)){

						isSelectQuery = true;
					}
				}

				query.isSelectQuery = isSelectQuery;

				if(isSelectQuery == true && level == 1 && type == this.TYPE_LIMIT){

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

					if(type != this.TYPE_QUERY_END){

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