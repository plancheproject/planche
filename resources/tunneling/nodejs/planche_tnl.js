var mysql = require('mysql'),
	http  = require('http'),
	url   = require('url'),
	querystring = require('querystring');

function Control() { 

    this.conn = null;
    this.types = {};
    this.callback = null;
    this.response = null;

    this.loadDataTypes();
}

Control.prototype = {

	connect : function (host, user, pass, db, response){

		this.response = response;

		this.conn = mysql.createConnection({
			host     : host,
			user     : user,
			password : pass,
			database : db
		});

		var me = this;
		this.conn.connect(function(err) {

			if(!err){

				return;
			}
			
		    me.error('Connect Error ('+err.errno+') '+err.code);
		});
	},

    sendHeader : function(){

        if (this.callback) {

            this.response.writeHead(200, {'Content-Type' : 'application/javascript'});
            
        } else {

            this.response.writeHead(200, {'Content-Type' : 'application/json'});
        }
    },

    setCharset : function(charset){

        if (!charset){

            return;
        }

        var query = 'SET NAMES '+charset;

		this.conn.query(query);
    },

    setCallback : function(callback){

        this.callback = callback;
    },

    loadDataTypes : function(){

		var types = ['TINYINT', 'SMALLINT', 'INT', 'MEDIUMINT', 'YEAR', 'FLOAT', 'DOUBLE', 'TIMESTAMP', 'DATE', 'DATETIME', 'TINYBLOB', 'MEDIUMBLOB', 'LONGBLOB', 'BLOB', 'BINARY', 'VARBINARY', 'BIT', 'CHAR', 'VARCHAR', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT', 'TEXT', 'ENUM', 'SET', 'DECIMAL', 'BIGINT', 'TIME', 'GEOMETRY'];
		var me = this;
		types.forEach(function(type, idx){

			me.types[type] = type.toLowerCase();
		});
	},

    query : function(query){

        if(!query){

            this.error('query was empty');
            return;
        }

        var start = new Date().getTime(),
        	affected_rows = 0,
        	insert_id = 0,
        	fields = [];
        	
        var me = this,
        	result = this.conn.query(query, function(err, results, fields){

        		if(err){

        			me.failure(err);
        			return;
        		}

				var end = new Date().getTime();
 
        		me.success(fields, results, start, end);	
        	});
    },

    success : function(fetchFields, fetchRows, start, end){

    	var insert_id = fetchRows.insertId || 0,
    		affected_rows = 0,
    		is_result_query = false,
    		fields = [],
    		me = this;

    	if(fetchRows.affectedRows){

    		affected_rows = fetchRows.affectedRows;
    	}

    	if(fetchRows.changedRows){

    		affected_rows = fetchRows.changedRows;
    	}

        this.sendHeader();

        if (this.callback !== null) {

            this.response.write(this.callback+'(');
        }
	    
		exec_time = end - start;

		if(fetchFields){

			is_result_query = true;

            fetchFields.forEach(function(field, idx){

                if(field.name.match(/([^a-zA-Z0-9_$#])+/)){

                    var name = "tmp"+idx;
                }
                else {

                    var name = field.name;
                }

                fields.push({
                    'name' : name,
                    'type' : me.types[field.type],
                    'table' : field.table,
                    'max_length' : field.length
                });
            });
		}

        this.response.write('{"success":true,');
        this.response.write('"exec_time":'+exec_time+',');
        this.response.write('"affected_rows":'+affected_rows+',');
        this.response.write('"insert_id":'+insert_id+',');
        this.response.write('"fields":'+JSON.stringify(fields)+',');
        this.response.write('"records":[');

        idx = 0;

        fetchRows.forEach(function(row){

            if(idx > 0){ 
                
                me.response.write(",");
            }

            var tmp = [];
            for(var p in row){

            	tmp.push(row[p]);
            }

            me.response.write(JSON.stringify(tmp));
            idx++;
        });

        this.response.write("],");

        this.response.write('"is_result_query":'+(is_result_query ? 'true':'false')+",");

        var end = new Date().getTime(),
        	transfer_time = end - start;

        this.response.write('"transfer_time":'+transfer_time+',');

        total_time = exec_time + transfer_time;
        
        this.response.write('"total_time":'+total_time);
        this.response.write("}");

        if(this.callback !== null){

            this.response.write(');');
        }

        this.response.end('\n');
    },

    failure : function(err){

    	this.conn.end();
    	this.error(err.errno+' : '+err.code);
    },

    error : function(error){

        this.output({
            'success' : false,
            'message' : error
        });
    },

    output : function(output){

        this.sendHeader();

        if (this.callback) {

            this.response.write(this.callback+'(');
        }
		
        this.response.write(JSON.stringify(output));

        if (this.callback) {

            this.response.write(');');
        }

        this.response.end('\n');
        return;
    }
}

var DEBUG = true;
var Planche = new Control();

//Create Webserver
http.createServer(function(request, response) {

	if (request.url == '/favicon.ico') {

		response.end('\n');
		return;
	}

	var parse = url.parse(request.url),
		get = querystring.parse(parse.query);

	if(get.callback){

		Planche.setCallback(get.callback);
	}

	Planche.connect(get.host, get.user, get.pass, get.db, response);
	Planche.setCharset(get.charset);
	Planche.query(get.query);

}).listen(8888);