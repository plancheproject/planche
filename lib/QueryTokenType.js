Ext.define('Planche.lib.QueryTokenType', function(){

	var type = {
		STRING			: 0,
		COMMENT			: 1,
		SPACE			: 2,
		TOP_LEVEL		: 3,
		JOIN			: 4,
		CONDITIONS		: 5,
		FUNCTION		: 6,
		BOUNDARY		: 7,
		QUOTE			: 8,
		DELIMITER		: 9,
		QUERY_END		: 10,
		LIMIT			: 11,
		COMPARISON		: 12,
		RESERVED_WORD	: 13,
		KEYWORD			: 14,
		TABLE			: 15,
		NUMBER			: 16,
		QUOTED_STRING	: 17
	};

	return {
		singleton: true,
		constructor: function(config) {

			this.callParent(arguments);
		},
		get : function(){

			return type; 
		}
	};
});