Ext.define('Planche.controller.layout.InfoTab', {
    extend  : 'Ext.app.Controller',
    prevNode: null,
    init    : function() {

        var app = this.getApplication();

        this.control({
            'info-tab'   : {
                show: function(grid) {

                    var node = app.getSelectedNode();

                    if (this.prevNode == node) {

                        return;
                    }

                    this.prevNode = node;

                    this.openInfo(node);
                }
            },
            'scheme-tree': {
                select: function(view) {

                    var treeview = view.views[0],
                        tree = treeview.up("treepanel");

                    app.setSelectedTree(tree);

                    var node = app.getSelectedNode();

                    this.openInfo(node);
                }
            }
        });
    },

    openInfo: function(node) {

        var app = this.getApplication(),
            type = node.raw.type,
            func = 'open' + type.charAt(0).toUpperCase() + type.slice(1) + 'Info';

        if (this[func]) {

            var info = app.getActiveInfoTab();
            if (info.isVisible()) {

                this[func](node);
            }
        }
    },

    openRootInfo: function(node) {

        var app = this.getApplication(),
            api = app.getAPIS(),
            db = app.getSelectedDatabase(),
            info = app.getActiveInfoTab(),
            dom = Ext.get(info.getEl().query("div[id$=innerCt]")),
            queries = {
                databases: api.getQuery('SHOW_DATABASES')
            },
            keys = Ext.Object.getKeys(queries),

            responses = {},
            tunneling;

        app.setLoading(true);

        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    node   : node,
                    success: function(config, response) {

                        responses[key] = response;
                        tunneling();
                    },
                    failure: function(config, response) {

                        app.openMessage(app.generateQueryErrorMsg(config.query, response.message));
                        app.setLoading(false);
                    }
                });
            }
            else {

                var html = [];
                html.push('<h3>Show Databases</h3>');
                this.makeTableByRecord(responses.databases, html);
                dom.setHTML(html.join(""));

                app.setLoading(false);
            }

        }, this))();
    },

    openDatabaseInfo: function(node) {

        var app = this.getApplication(),
            api = app.getAPIS(),
            me = this,
            db = app.getSelectedDatabase(),
            info = app.getActiveInfoTab(),
            dom = Ext.get(info.getEl().query("div[id$=innerCt]")),
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

        app.setLoading(true);

        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    node   : node,
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        if (key == 'Create Database DDL') {

                            html.push('<div class="info">' + response.records[0][1].replace(/\n/gi, '<br/>') + '</div>');
                        }
                        else {

                            me.makeTableByRecord(response, html);
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

                dom.setHTML(html.join(""));
                app.setLoading(false);
            }

        }, this))();
    },

    openTablesInfo: function(node) {

        var app = this.getApplication(),
            api = app.getAPIS(),
            db = app.getSelectedDatabase(),
            info = app.getActiveInfoTab(),
            dom = Ext.get(info.getEl().query("div[id$=innerCt]")),
            me = this,
            html = [];

        app.setLoading(true);

        app.tunneling({
            db     : db,
            query  : api.getQuery('SHOW_ALL_TABLE_STATUS', db),
            node   : node,
            success: function(config, response) {

                html.push('<h3>Show Table Status</h3>');
                me.makeTableByRecord(response, html);
                dom.setHTML(html.join(""));

                app.setLoading(false);
            },
            failure: function(config, response) {

                app.openMessage(app.generateQueryErrorMsg(config.query, response.message));
                app.setLoading(false);
            }
        });
    },

    openTableInfo: function(node) {

        var app = this.getApplication(),
            api = app.getAPIS(),
            me = this,
            db = app.getSelectedDatabase(),
            tb = app.getSelectedTable(),
            info = app.getActiveInfoTab(),
            dom = Ext.get(info.getEl().query("div[id$=innerCt]")),
            queries = {
                'Show Table Fields' : api.getQuery('SHOW_FULL_FIELDS', db, tb),
                'Show Table Indexes': api.getQuery('TABLE_KEYS_INFO', db, tb),
                'Create Table DDL'  : api.getQuery('TABLE_CREATE_INFO', db, tb)
            },
            keys = Ext.Object.getKeys(queries),
            html = [],
            tunneling;

        app.setLoading(true);
        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    node   : node,
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');

                        if (key == 'Create Table DDL') {

                            if (response.records.length == 0) {

                                html.push(app.generateQueryErrorMsg(config.query, 'Empty'));
                            }
                            else {

                                html.push('<div class="info">' + response.records[0][1].replace(/\n/gi, '<br/>') + '</div>');
                            }
                        }
                        else {

                            me.makeTableByRecord(response, html);
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

                dom.setHTML(html.join(""));
                app.setLoading(false);
            }

        }, this))();
    },

    openColumnsInfo: function(node) {

        var app = this.getApplication(),
            api = app.getAPIS(),
            me = this,
            db = app.getSelectedDatabase(),
            tb = app.getSelectedTable(),
            info = app.getActiveInfoTab(),
            dom = Ext.get(info.getEl().query("div[id$=innerCt]")),
            queries = {
                'Show Table Fields': api.getQuery('SHOW_FULL_FIELDS', db, tb)
            },
            keys = Ext.Object.getKeys(queries),
            html = [],
            tunneling;

        app.setLoading(true);

        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    node   : node,
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        me.makeTableByRecord(response, html);
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

                dom.setHTML(html.join(""));
                app.setLoading(false);
            }

        }, this))();
    },

    openIndexesInfo: function(node) {

        var app = this.getApplication(),
            api = app.getAPIS(),
            me = this,
            db = app.getSelectedDatabase(),
            tb = app.getSelectedTable(),
            info = app.getActiveInfoTab(),
            dom = Ext.get(info.getEl().query("div[id$=innerCt]")),
            queries = {
                'Show Table Indexes': api.getQuery('TABLE_KEYS_INFO', db, tb)
            },
            keys = Ext.Object.getKeys(queries),
            html = [],
            tunneling;

        app.setLoading(true);

        (tunneling = Ext.Function.bind(function() {

            var key = keys.shift();
            if (key) {

                app.tunneling({
                    db     : db,
                    query  : queries[key],
                    node   : node,
                    success: function(config, response) {

                        html.push('<h3>' + key + '</h3>');
                        me.makeTableByRecord(response, html);
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

                dom.setHTML(html.join(""));
                app.setLoading(false);
            }

        }, this))();
    },

    makeTableByRecord: function(record, html) {

        var html = html || [];
        html.push('<table class="info" width="100%">');
        html.push('<tr>');
        Ext.Array.each(record.fields, function(col, cidx) {

            html.push('<th>' + col.name + '</th>');
        });
        html.push('</tr>');

        if (record.records.length === 0) {

            html.push('<tr>');
            html.push('<td colspan="' + record.fields.length + '">There\'s no data to display</td>');
            html.push('</tr>');
            html.push('</table>');
            return html;
        }

        Ext.Array.each(record.records, function(row, ridx) {

            html.push('<tr>');
            Ext.Array.each(record.fields, function(col, cidx) {

                html.push('<td>' + row[cidx] + '</td>');
            });
            html.push('</tr>');
        });
        html.push('</table>');
        return html;
    }
});