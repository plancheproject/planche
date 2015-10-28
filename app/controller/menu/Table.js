Ext.define('Planche.controller.menu.Table', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        var app = this.getApplication();

        topBtn.menu.add([{
            text        : 'Paste SQL Statement',
            allowDisable: function(topBtn, menu) {

                if (app.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            menu        : [{
                text: 'INSERT INTO &lt;Table Name&gt;..',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.pasteSQLStatement(db, table, 'insert');
                }
            }, {
                text: 'UPDATE &lt;Table Name&gt; SET..',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.pasteSQLStatement(db, table, 'update');
                }
            }, {
                text: 'DELETE FROM &lt;Table Name&gt;..',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.pasteSQLStatement(db, table, 'delete');
                }
            }, {
                text: 'SELECT &lt;col-1&gt;..&lt;col-n&gt; FROM &lt;Table Name&gt;',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.pasteSQLStatement(db, table, 'select');
                }
            }, {
                text   : 'INSERT ... ON DUPLICATE KEY UPDATE',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.pasteSQLStatement(db, table, 'duplicate_update');
                }
            }]
        }, {
            text: 'Copy Table To Differnt Host/Database',
            allowDisable: function(topBtn, menu) {

                if (app.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var node = app.getSelectedNode(true);
                app.openCopyDatabaseWindow(node);
            }
        }, '-', {
            text: 'Open Table',
            allowDisable: function(topBtn, menu) {

                if (app.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedNode();

                app.openTable(db, table);
            }
        }, {
            text: 'Create Table',
            allowDisable: function(topBtn, menu) {

                if (app.getSelectedDatabase()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var db = app.getSelectedDatabase();
                app.openCreateTableWindow(db);
            }
        }, {
            text: 'Alter Table',
            allowDisable: function(topBtn, menu) {

                if (app.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedTable();

                app.openAlterTableWindow(db, table, 'table-schema-tab');
            }
        }, {
            text: 'Table Properties',
            allowDisable: function(topBtn, menu) {

                if (app.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedTable();

                app.openAlterTableWindow(db, table, 'table-properties-tab');
            }
        }, {
            text: 'Manage Indexes',
            allowDisable: function(topBtn, menu) {

                if (app.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedTable();

                app.openAlterTableWindow(db, table, 'table-indexes-tab');
            }
        }, {
            text: 'View table\'s sql',
            allowDisable: function(topBtn, menu) {

                if (app.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedTable();

                app.openAlterTableWindow(db, table, 'table-sql-tab');
            }
        }, {
            text: 'View Table information',
            allowDisable: function(topBtn, menu) {

                if (app.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedTable();

                app.openAlterTableWindow(db, table, 'table-info-tab');
            }
        }, {
            text: 'More Table Operations',
            allowDisable: function(topBtn, menu) {

                if (app.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            menu        : [{
                text   : 'Rename Table',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.renameTable(db, table);
                }
            }, {
                text   : 'Truncate Table',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.truncateTable(db, table, function() {

                        app.openTable(db, table);
                    });
                }
            }, {
                text   : 'Drop Table From Database',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.dropTable(db, table);
                }
            }, {
                text   : 'Reorder Column(s)',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable(true);

                    app.openReorderColumns(db, table);
                }
            }, {
                text   : 'Duplicate Table Structure/Data',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.duplicateTable(db, table, function(){

                        var node = app.getSelectedTable(true);
                        app.getSelectedTree().getSelectionModel().select(node.parentNode);
                        app.reloadTree();
                    });
                }
            }, {
                text   : 'View Advanced Properties',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.openAdvancedProperties(db, table);
                }
            }, {
                text: 'Change Table To Type',
                menu: [
                    {

                        text   : 'MYISAM',
                        handler: function(btn) {

                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    },
                    {

                        text   : 'MRG_MYISAM',
                        handler: function(btn) {

                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    },
                    {

                        text   : 'CSV',
                        handler: function(btn) {

                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    },
                    {

                        text   : 'BLACKHOLE',
                        handler: function(btn) {

                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    },
                    {

                        text   : 'MEMORY',
                        handler: function(btn) {

                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    },
                    {

                        text   : 'FEDERATED',
                        handler: function(btn) {

                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    },
                    {

                        text   : 'ARCHIVE',
                        handler: function(btn) {

                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    },
                    {

                        text   : 'INNODB',
                        handler: function(btn) {

                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    },
                    {

                        text   : 'PERFORMANCE_SCHEMA',
                        handler: function(btn) {

                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    }
                ]
            }]
        }, '-', {
            text        : 'Create Trigger',
            disabled    : true,
            allowDisable: function() {

                if (app.getSelectedDatabase()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var db = app.getSelectedDatabase();
                app.createTrigger(db);
            }
        }]);

        this.added = true;
    }
});