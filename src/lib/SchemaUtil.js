Ext.define('Planche.lib.SchemaUtil', {
    singleton            : true,
    alternateClassName   : ['Planche.SchemaUtil'],
    exportAllSchemaToHTML: function(db, cmp, updateMethod) {

        var app = Planche.getApplication(),
            api = app.getAPIS(),
            queries = {
                'Table Information'    : api.getQuery('SHOW_ALL_TABLE_STATUS', db),
                'View Information'     : api.getQuery('SHOW_VIEWS', db),
                'Procedure Information': api.getQuery('SHOW_PROCEDURES', db),
                'Function Information' : api.getQuery('SHOW_FUNCTIONS', db),
                'Trigger Information'  : api.getQuery('SHOW_TRIGGERS', db),
                'Event Information'    : api.getQuery('SHOW_EVENTS', db),
                'Create Database DDL'  : api.getQuery('SHOW_DATABASE_DDL', db)
            },
            keys = Ext.Object.getKeys(queries),
            html = [],
            tunneling;

        cmp['setLoading'](true);

        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        if (key == 'Create Database DDL') {

                            html.push('<div class="info">' + response.records[0][1].replace(/\n/gi, '<br/>') + '</div>');
                        }
                        else if (key.match(/^Table Schema/)) {

                            html.push('<div class="info">' + response.records[0][1].replace(/\n/gi, '<br/>') + '</div>');
                        }
                        else {

                            if (key == 'Table Information') {

                                response.records.map(function(row, idx) {

                                    queries['Table Schema - ' + row[0]] = api.getQuery('TABLE_CREATE_INFO', db, row[0]);
                                    keys.unshift('Table Schema - ' + row[0]);

                                    queries['Table Indexes - ' + row[0]] = api.getQuery('INDEX_KEYS_INFO', db, row[0]);
                                    keys.unshift('Table Indexes - ' + row[0]);

                                    queries['Table Fields - ' + row[0]] = api.getQuery('SHOW_COLUMNS', db, row[0]);
                                    keys.unshift('Table Fields - ' + row[0]);
                                });
                            }

                            html.push(Planche.SchemaUtil.generateRecordToHTML(response));
                        }
                        tunneling();
                    },
                    failure: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(app.generateQueryErrorMsg(config.query, response.message));
                        tunneling();
                    }
                });
            }
            else {

                cmp[updateMethod](html.join(""));
                cmp['setLoading'](false);
            }

        }, this))();
    },

    exportRootInfoToHTML: function(db, nodeName, cmp, updateMethod) {

        var app = Planche.getApplication(),
            api = app.getAPIS(),
            queries = {
                'Show Databases': api.getQuery('SHOW_DATABASES')
            },
            keys = Ext.Object.getKeys(queries),
            html = [],
            tunneling;

        cmp['setLoading'](true);

        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(Planche.SchemaUtil.generateRecordToHTML(response));
                        tunneling();
                    },
                    failure: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(app.generateQueryErrorMsg(config.query, response.message));
                        tunneling();
                    }
                });
            }
            else {

                cmp[updateMethod](html.join(""));
                cmp['setLoading'](false);
            }

        }, this))();
    },

    exportDatabaseInfoToHTML: function(db, nodeName, cmp, updateMethod) {

        var app = Planche.getApplication(),
            api = app.getAPIS(),
            queries = {
                'Table Information'    : api.getQuery('SHOW_ALL_TABLE_STATUS', db),
                'View Information'     : api.getQuery('SHOW_VIEWS', db),
                'Procedure Information': api.getQuery('SHOW_PROCEDURES', db),
                'Function Information' : api.getQuery('SHOW_FUNCTIONS', db),
                'Trigger Information'  : api.getQuery('SHOW_TRIGGERS', db),
                'Event Information'    : api.getQuery('SHOW_EVENTS', db),
                'Create Database DDL'  : api.getQuery('SHOW_DATABASE_DDL', db)
            },
            keys = Ext.Object.getKeys(queries),
            html = [],
            tunneling;

        cmp['setLoading'](true);

        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        if (key == 'Create Database DDL') {

                            html.push('<div class="info">' + response.records[0][1].replace(/\n/gi, '<br/>') + '</div>');
                        }
                        else {

                            html.push(Planche.SchemaUtil.generateRecordToHTML(response));
                        }
                        tunneling();
                    },
                    failure: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(app.generateQueryErrorMsg(config.query, response.message));
                        tunneling();
                    }
                });
            }
            else {

                cmp[updateMethod](html.join(""));
                cmp['setLoading'](false);
            }

        }, this))();
    },

    exportTablesInfoToHTML: function(db, nodeName, cmp, updateMethod) {

        var app = Planche.getApplication(),
            api = app.getAPIS(),
            queries = {
                'Show Table Status': api.getQuery('SHOW_ALL_TABLE_STATUS', db)
            },
            keys = Ext.Object.getKeys(queries),
            html = [],
            tunneling;

        cmp['setLoading'](true);

        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(Planche.SchemaUtil.generateRecordToHTML(response));
                        tunneling();
                    },
                    failure: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(app.generateQueryErrorMsg(config.query, response.message));
                        tunneling();
                    }
                });
            }
            else {

                cmp[updateMethod](html.join(""));
                cmp['setLoading'](false);
            }

        }, this))();
    },

    exportTableInfoToHTML: function(db, table, cmp, updateMethod) {

        var app = Planche.getApplication(),
            api = app.getAPIS(),
            queries = {
                'Show Table Fields' : api.getQuery('SHOW_FULL_FIELDS', db, table),
                'Show Table Indexes': api.getQuery('TABLE_KEYS_INFO', db, table),
                'Create Table DDL'  : api.getQuery('TABLE_CREATE_INFO', db, table)
            },
            keys = Ext.Object.getKeys(queries),
            html = [],
            tunneling;

        cmp['setLoading'](true);
        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');

                        if (key == 'Create Table DDL') {

                            if (response.records.length === 0) {

                                html.push(app.generateQueryErrorMsg(config.query, 'Empty'));
                            }
                            else {

                                html.push('<div class="info">' + response.records[0][1].replace(/\n/gi, '<br/>') + '</div>');
                            }
                        }
                        else {

                            html.push(Planche.SchemaUtil.generateRecordToHTML(response));
                        }

                        tunneling();
                    },
                    failure: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(app.generateQueryErrorMsg(config.query, response.message));
                        tunneling();
                    }
                });
            }
            else {

                cmp[updateMethod](html.join(""));
                cmp['setLoading'](false);
            }

        }, this))();
    },

    exportColumnsInfoToHTML: function(db, table, cmp, updateMethod) {

        var app = Planche.getApplication(),
            api = app.getAPIS(),
            queries = {
                'Show Table Fields': api.getQuery('SHOW_FULL_FIELDS', db, table)
            },
            keys = Ext.Object.getKeys(queries),
            html = [],
            tunneling;

        cmp['setLoading'](true);

        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(Planche.SchemaUtil.generateRecordToHTML(response));
                        tunneling();
                    },
                    failure: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(app.generateQueryErrorMsg(config.query, response.message));
                        tunneling();
                    }
                });
            }
            else {

                cmp[updateMethod](html.join(""));
                cmp['setLoading'](false);
            }

        }, this))();
    },

    exportIndexesInfoToHTML: function(db, table, cmp, updateMethod) {

        var app = Planche.getApplication(),
            api = app.getAPIS(),
            queries = {
                'Show Table Indexes': api.getQuery('TABLE_KEYS_INFO', db, table)
            },
            keys = Ext.Object.getKeys(queries),
            html = [],
            tunneling;

        cmp['setLoading'](true);

        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(Planche.SchemaUtil.generateRecordToHTML(response));
                        tunneling();
                    },
                    failure: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        html.push(app.generateQueryErrorMsg(config.query, response.message));
                        tunneling();
                    }
                });
            }
            else {

                cmp[updateMethod](html.join(""));
                cmp['setLoading'](false);
            }

        }, this))();
    },

    generateRecordToHTML: function(record) {

        var html = '';
        html += '<table class="info" width="100%">';
        html += '<tr>';
        Ext.Array.each(record.fields, function(col, cidx) {

            html += '<th>' + col.name + '</th>';
        });
        html += '</tr>';

        if (record.records.length === 0) {

            html += '<tr>';
            html += '<td colspan="' + record.fields.length + '">There\'s no data to display</td>';
            html += '</tr>';
            html += '</table>';
            return html;
        }

        Ext.Array.each(record.records, function(row, ridx) {

            html += '<tr>';
            Ext.Array.each(record.fields, function(col, cidx) {

                html += '<td>' + row[cidx] + '</td>';
            });
            html += '</tr>';
        });
        html += '</table>';
        return html;
    }
});