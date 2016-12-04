var tunneling = (function (module){

    var mysql = require('mysql');
    var deferred = require('deferred');
    var connections = {};

    function Tunnel() {

        this.conn = null;
        this.mode = 'http';
        this.types = {};
        this.callback = null;
        this.response = '';
        this.contents = '';
        this.loadDataTypes();
    }

    Tunnel.prototype = {

        connect: function(host, user, pass, db) {

            var def = deferred();

            this.conn = mysql.createConnection({
                host    : host,
                user    : user,
                password: pass,
                database: db
            });

            var me = this;

            this.conn.connect(function(err) {

                if (!err) {

                    def.resolve({
                        result : true,
                        message : 'Connection Successful'
                    });
                    return;
                }

                def.reject({
                    result : false,
                    message : 'Connect Error (' + err.errno + ') ' + err.code
                });
            });

            return def.promise;
        },

        close: function() {

            this.conn.end();
        },

        sendHeader: function() {

            if(!this.response){

                return;
            }

            if (this.callback) {

                this.response.writeHead(200, {'Content-Type': 'application/javascript'});

            } else {

                this.response.writeHead(200, {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type'               : 'application/json'
                });
            }
        },

        sendExportHeader: function(name) {

            if(!this.response){

                return;
            }

            this.response.writeHead(200, {
                'Content-type'       : 'text/csv',
                'Content-Disposition': 'attachment; filename=' + name + '.csv',
                'Pragma'             : 'no-cache',
                'Expires'            : '0'
            });
        },

        setCharset: function(charset) {

            if (!charset) {

                return;
            }

            var query = 'SET NAMES ' + charset;

            this.query(query);
        },

        setMode : function(mode){

            this.mode = mode;
        },

        setResponse : function(response) {

            this.response = response;
        },

        setCallback: function(callback) {

            this.callback = callback;
        },

        loadDataTypes: function() {

            var types = ['TINYINT', 'SMALLINT', 'INT', 'MEDIUMINT', 'YEAR', 'FLOAT', 'DOUBLE', 'TIMESTAMP', 'DATE', 'DATETIME', 'TINYBLOB', 'MEDIUMBLOB', 'LONGBLOB', 'BLOB', 'BINARY', 'VARBINARY', 'BIT', 'CHAR', 'VARCHAR', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT', 'TEXT', 'ENUM', 'SET', 'DECIMAL', 'BIGINT', 'TIME', 'GEOMETRY'];
            var me = this;
            types.forEach(function(type, idx) {

                me.types[type] = type.toLowerCase();
            });
        },

        write: function(str){

            if(this.mode == 'http'){

                this.response.write(str);
            }
            else if(this.mode == 'direct') {

                this.contents += str;
            }
        },

        query: function(query) {

            var def = deferred();

            this.conn.query(query, function(err, results, fields){

                if (err) {

                    def.reject(err.toString());
                    return;
                }

                def.resolve([ results, fields ]);
            });

            return def.promise;
        },

        execute: function(query, type, csv) {

            var def = deferred();

            if (!query) {

                def.reject('query_was_empty');
                return def.promise;
            }

            var start         = new Date().getTime(),
                affected_rows = 0,
                insert_id     = 0,
                fields        = [],
                me            = this;

            this.contents = '';

            me.query(query).then(
                function(res){

                    var end = new Date().getTime(),
                        results = res[0],
                        fields = res[1];

                    if (type == 'export') {

                        me.exportCSV(fields, results, csv);
                    }
                    else {

                        me.success(fields, results, start, end);
                    }

                    def.resolve();
                },
                function(err){

                    me.failure(err);

                    def.reject();
                }
            );

            return def.promise;
        },

        success: function(fetchFields, fetchRows, start, end) {

            var insert_id       = fetchRows.insertId || 0,
                affected_rows   = 0,
                is_result_query = false,
                fields          = [],
                me              = this;

            if (fetchRows.affectedRows) {

                affected_rows = fetchRows.affectedRows;
            }

            if (fetchRows.changedRows) {

                affected_rows = fetchRows.changedRows;
            }

            me.sendHeader();

            if (me.callback !== null) {

                me.write(me.callback + '(');
            }

            exec_time = end - start;

            if (fetchFields) {

                is_result_query = true;

                fetchFields.forEach(function(field, idx) {

                    var name = field.name;

                    fields.push({
                        'name'      : name,
                        'org_name'  : field.orgName,
                        'type'      : me.types[field.type],
                        'table'     : field.table,
                        'org_table' : field.orgTable,
                        'default'   : field.default,
                        'max_length': field.length,
                        'length'    : field.length
                    });
                });
            }

            me.write('{"success":true,');
            me.write('"exec_time":' + exec_time + ',');
            me.write('"affected_rows":' + affected_rows + ',');
            me.write('"insert_id":' + insert_id + ',');
            me.write('"fields":' + JSON.stringify(fields) + ',');
            me.write('"records":[');

            if (fetchFields) {

                idx = 0;
                fetchRows.forEach(function(row) {

                    if (idx > 0) {

                        me.write(",");
                    }

                    var tmp = [];
                    for (var p in row) {

                        tmp.push(row[p]);
                    }

                    me.write(JSON.stringify(tmp));
                    idx++;
                });
            }

            me.write("],");

            me.write('"is_result_query":' + (is_result_query ? 'true' : 'false') + ",");

            var end           = new Date().getTime(),
                transfer_time = end - start;

            me.write('"transfer_time":' + transfer_time + ',');

            total_time = exec_time + transfer_time;

            me.write('"total_time":' + total_time);
            me.write("}");

            if (me.callback !== null) {

                me.write(');');
            }
        },

        exportCSV: function(fetchFields, fetchRows, csv) {

            var me  = this,
                csv = csv + '_';

            me.sendExportHeader(csv);

            fetchFields.forEach(function(field, idx) {

                if (idx > 0) {

                    me.write(",");
                }

                me.write(field.name);
            });

            if (fetchFields) {

                me.write("\n");
            }

            fetchRows.forEach(function(row) {

                var idx = 0;
                for (var p in row) {

                    if (idx > 0) {

                        me.write(",");
                    }

                    me.write('"' + row[p] + '"');
                    idx++;
                }

                me.write("\n");
            });
        },

        failure: function(error) {

            this.output({
                'success': false,
                'message': error
            });
        },

        output: function(output) {

            this.sendHeader();

            if (this.callback) {

                this.write(this.callback + '(');
            }

            this.write(JSON.stringify(output));

            if (this.callback) {

                this.write(');');
            }
        }
    }

    function printLog (response, string){

        if(response){

            console.log(string);
        }
    }

    function execute (Tunneling, cmd){

        var def = deferred();

        printLog(Tunneling.response, "The execution SQL is");
        printLog(Tunneling.response, cmd.query);

        var csv = cmd.csv || null,
            query = cmd.query,
            type = cmd.type;

        if (cmd.type === 'export') {

            if (typeof cmd.query == 'object') {

                query = cmd.query[0];
            }
        }

        Tunneling.execute(query, type, csv).then(
            function (){

                def.resolve(Tunneling.contents);
            },
            function (){

                def.reject(Tunneling.contents);
            }
        );

        printLog(Tunneling.response, "-----------------------------------------------------------------------");

        return def.promise;
    }

    function tunneling (params, response) {

        var def = deferred(),
            cmd = params.cmd,
            mode = params.mode,
            callback = params.callback,
            connectId = params.connectId || 'user@host';

        var Tunneling = new Tunnel();
        Tunneling.setResponse(response);
        Tunneling.setMode(mode);

        if(!cmd){

            Tunneling.failure('Command was empty');
            return;
        }

        printLog(response, "Execute Query");

        if (callback) {

            printLog(response, "JSON Callback : " + callback);
            Tunneling.setCallback(callback);
        }

        var cmd = new Buffer(cmd, 'base64').toString('ascii'),
            cmd = JSON.parse(cmd),
            host = cmd.host,
            user = cmd.user,
            pass = cmd.pass,
            db = cmd.db,
            type = cmd.type,
            charset = cmd.charset;

        var _execute = function(res){

            Tunneling.setCharset(charset);

            if (type == 'copy') {

                Tunneling.query("SET foreign_key_checks = 0");
            }

            execute(Tunneling, cmd).then(
                function(contents){

                    def.resolve(contents);
                },
                function(err){

                    def.reject(err);
                }
            );
        };

        if(connections[connectId]){

            Tunneling.conn = connections[connectId];
            _execute();
        }
        else {

            var result = Tunneling.connect(host, user, pass, db);
            result.then(
                function(){

                    connections[connectId] = Tunneling.conn;
                    _execute();
                },
                function(res){

                    Tunneling.failure(res.message);
                    def.reject();
                }
            );
        }

        return def.promise;
    }

    module.exports = tunneling;

    return tunneling;

})(module);
