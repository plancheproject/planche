Ext.define('Planche.lib.Query', {
	constructor : function(query){

		Ext.apply(this, query);
	},

	getPrevRecordSetSQL : function(){

		this.start -= this.end;

		if(this.start < 0) this.start = 0;
		
		return this.getSQL();
	},

	getNextRecordSetSQL : function(){

		this.start += this.end;

		return this.getSQL();
	},

	getPrevRecordSQL : function(){

		this.start--;

		if(this.start < 0) this.start = 0;
		
		return this.getSQL();
	},

	getNextRecordSQL : function(){

		this.start++;

		return this.getSQL();
	},

	getSQL : function(){
		
		if(this.isSelectQuery == true){

			return this.sql + ' LIMIT ' + this.start + ", " + this.end;
		}
		else {

			return this.raw;
		}
	},

	getRawSQL : function(){

		return this.raw;
	},

	getTokens : function(){

		return this.tokens;
	},

	isSelectQuery : function(){

		return this.selectQuery;
	},

	isDelimiter : function(){

		return this.delimiter;
	},

	hasNext : function(){

		return this.raw.length > this.end ? true : false;
	},

	setRecords : function(records){

		Ext.apply(this, {
			records : records
		});
	},

	isSelectedQuery : function(line, cursor){

		var linecursor = parseFloat(line + "." + cursor);

		if(this.sline <= linecursor && linecursor >= this.eline){

			return true;
		}
		else {

			return false;
		}
	}
});