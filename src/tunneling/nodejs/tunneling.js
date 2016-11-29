var mysql = require('mysql');

function Tunnel() {

    this.conn = null;
    this.types = {};
    this.callback = null;
    this.response = null;

    this.loadDataTypes();
}

Tunnel.prototype = {

    connect: function(host, user, pass, db, response, callback) {

        this.response = response;

        this.conn = mysql.createConnection({
            host    : host,
            user    : user,
            password: pass,
            database: db
        });

        var me = this;

        this.conn.connect(function(err) {

            if (!err) {

                callback({
                    result : true,
                    message : 'Connection Successful'
                })

                return;
            }

            callback({
                result : false,
                message : 'Connect Error (' + err.errno + ') ' + err.code
            })
        });
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

    responseWrite: function(str){

        if(this.response){

            this.response.write(str);
            return;
        }

        console.log(str);
    },

    query: function(query, callback) {

        return this.conn.query(query, callback);
    },

    execute: function(query, type, csv) {

        if (!query) {

            this.error('query was empty');
            return;
        }

        var start         = new Date().getTime(),
            affected_rows = 0,
            insert_id     = 0,
            fields        = [];

        var me     = this,
            result = this.query(query, function(err, results, fields) {

                if (err) {

                    me.failure(err);
                    return;
                }

                var end = new Date().getTime();

                if (type == 'export') {

                    me.exportCSV(fields, results, csv);
                }
                else {

                    me.success(fields, results, start, end);
                }

            });
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

        this.sendHeader();

        if (this.callback !== null) {

            this.response.write(this.callback + '(');
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

        this.responseWrite('{"success":true,');
        this.responseWrite('"exec_time":' + exec_time + ',');
        this.responseWrite('"affected_rows":' + affected_rows + ',');
        this.responseWrite('"insert_id":' + insert_id + ',');
        this.responseWrite('"fields":' + JSON.stringify(fields) + ',');
        this.responseWrite('"records":[');

        if (fetchFields) {

            idx = 0;
            fetchRows.forEach(function(row) {

                if (idx > 0) {

                    me.responseWrite(",");
                }

                var tmp = [];
                for (var p in row) {

                    tmp.push(row[p]);
                }

                me.responseWrite(JSON.stringify(tmp));
                idx++;
            });
        }

        this.responseWrite("],");

        this.responseWrite('"is_result_query":' + (is_result_query ? 'true' : 'false') + ",");

        var end           = new Date().getTime(),
            transfer_time = end - start;

        this.responseWrite('"transfer_time":' + transfer_time + ',');

        total_time = exec_time + transfer_time;

        this.responseWrite('"total_time":' + total_time);
        this.responseWrite("}");

        if (this.callback !== null) {

            this.responseWrite(');');
        }

        if(this.response) {

            this.response.end('\n');
        }
    },

    exportCSV: function(fetchFields, fetchRows, csv) {

        var me  = this,
            csv = csv + '_';

        me.sendExportHeader(csv);

        fetchFields.forEach(function(field, idx) {

            if (idx > 0) {

                me.response.write(",");
            }

            me.response.write(field.name);
        });

        if (fetchFields) {

            me.response.write("\n");
        }

        fetchRows.forEach(function(row) {

            var idx = 0;
            for (var p in row) {

                if (idx > 0) {

                    me.response.write(",");
                }

                me.response.write('"' + row[p] + '"');
                idx++;
            }

            me.response.write("\n");
        });
    },

    failure: function(err) {

        this.conn.end();
        this.error(err.errno + ' : ' + err.code);
    },

    error: function(error) {

        this.output({
            'success': false,
            'message': error
        });
    },

    output: function(output) {

        this.sendHeader();

        if (this.callback) {

            this.responseWrite(this.callback + '(');
        }

        this.responseWrite(JSON.stringify(output));

        if (this.callback) {

            this.response.write(');');
        }

        return;
    }
}

function printLog(response, string){

    if(response){

        console.log(string);
    }
}

function tunneling (params, response) {

    var Tunneling = new Tunnel();

    printLog(response, "Execute Query");

    if (params.callback) {

        printLog(response, "JSON Callback : " + params.callback);
        Tunneling.setCallback(params.callback);
    }

    var cmd = new Buffer(params.cmd, 'base64').toString('ascii'),
        cmd = JSON.parse(cmd);

    Tunneling.connect(cmd.host, cmd.user, cmd.pass, cmd.db, response, function(res){

        if(!res.result){

            Tunneling.error(res.message);

            if(response) {

                response.end('\n');
            }
            return;
        }

        printLog(response, "The execution SQL is");
        printLog(response, cmd.query);

        Tunneling.setCharset(cmd.charset);

        if (cmd.type === 'export') {

            if (typeof cmd.query == 'object') {

                Tunneling.execute(cmd.query[0], cmd.type, cmd.csv);
            }
            else {

                Tunneling.execute(cmd.query, cmd.type, cmd.csv);
            }

        } else {

            if (cmd.type == 'copy') {

                Tunneling.query("SET foreign_key_checks = 0");
            }

            Tunneling.execute(cmd.query, cmd.type);
        }

        Tunneling.close();

        printLog(response, "-----------------------------------------------------------------------");
    });
}

module.exports = tunneling;
