Ext.define('Planche.lib.QueryAlignment', function(){

	var type;

	var newLineKeywords = [
        'SELECT', 'FROM', 'WHERE', 'SET', 'ORDER', 'GROUP', 'LIMIT', 'DROP',
        'VALUES', 'UPDATE', 'HAVING', 'ADD', 'AFTER', 'DELETE', 'UNION', 'EXCEPT', 'INTERSECT',
        'CREATE'
    ];

    var tabKeywords = [
    	'AND', 'OR'
    ];

	return {
		singleton: true,
		constructor: function(config) {

			this.callParent(arguments);
			type = Planche.lib.QueryTokenType.get();
		},
		alignment : function(query){

			var tmp = '';
			var indent = 1;
			var tab = '';
			var prev = '';
			Ext.Array.each(query.getTokens(), function(token, idx){

				prev = tmp[tmp.length - 1] || '';

				if(token.type == type.SPACE){

					if(token.value.match(/\n/)){

						return;
					}
					else if(token.value == ' '){

						if(prev == ' '){

							return;
						}
					}

					tmp += token.value;
					return;
				}

				if(token.type == type.STRING){

					var value = token.value.toUpperCase();
					tmp += value;
					
					if(value == "BEGIN"){

						tmp += '\n\n\n';
					}
					return;
				}

				if(token.type == type.JOIN){

					tmp += (prev == '\n' ? '' : '\n')+tab;
					tmp += token.value.toUpperCase();
					return;
				}

				if(newLineKeywords.indexOf(token.value.toUpperCase()) > -1){

					tmp += (prev == '\n' ? '' : '\n')+tab;
					tmp += token.value.toUpperCase();
					return;
				}

				if(token.type == type.COMMENT){

					tmp += (prev == '\n' ? '' : '\n')+tab;
					tmp += token.value;
					tmp += (prev == '\n' ? '' : '\n')+tab;
					return;
				}

				if(tabKeywords.indexOf(token.value.toUpperCase()) > -1){

					tmp += (prev == '\n' ? '' : '\n')+'\t'+tab;
					tmp += token.value.toUpperCase();
					return;
				}

				if(token.type == type.KEYWORD){

					tmp += token.value.toUpperCase();
					return;
				}

				if(token.type == type.FUNCTION){

					tmp += token.value.toUpperCase();
					return;
				}

				if(token.type == type.BOUNDARY){

					if(token.value == '('){

						indent++;
						tab = new Array(indent).join("\t");
					}
					else if(token.value == ')'){

						indent--;
						if(indent < 1){ indent = 1; }
						tab = new Array(indent).join("\t");
						tmp += (prev == '\n' ? '' : '\n')+tab;
					}
				}

				tmp += token.value;
			});

			return tmp;
		}
	};
});