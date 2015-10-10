Ext.define('Planche.controller.layout.SchemaTreeContextMenu', {
    extend: 'Ext.app.Controller',
    init  : function() {

        this.control({
            'schema-tree': {
                'itemcontextmenu': this.initContextMenu
            }
        });
    },

    initContextMenu: function(view, node, item, index, e, eOpts) {

        //서버트리의 이벤트를 잡아 내서 node위에서 right click을 했을 경우만 
        //context메뉴를 보여준다.
        e.preventDefault();

        var app = this.getApplication(),
            menu = app.getSchemaContextMenu(),
            type = node.raw.type,
            func = 'load' + type.charAt(0).toUpperCase() + type.slice(1) + 'ContextMenu';

        if (!this[func]) {

            return;
        }

        menu.removeAll();
        menu.add(this[func]());
        menu.showAt(e.getXY());
    },

    loadRootContextMenu: function() {

        var app = this.getApplication();

        return [
            {
                text   : 'Create Database',
                handler: function() {

                    app.createDatabase();
                }
            },
            {
                text   : 'Refresh All',
                handler: function() {

                    app.reloadTree();
                }
            }
        ];
    },

    loadDatabaseContextMenu: function() {

        var app = this.getApplication();

        return [
            {
                text   : 'Refresh Databases',
                scope  : app,
                handler: app.reloadTree
            },
            {
                text   : 'Create Database',
                handler: function(){

                    app.createDatabase();
                }
            }, {
                text   : 'Alter Database',
                handler: function() {

                    var db = app.getSelectedDatabase();
                    app.alterDatabase(db);
                }
            },
            {
                text   : 'Drop Database',
                handler: function() {

                    var db = app.getSelectedDatabase();
                    app.dropDatabase(db, function() {

                        var node = app.getSelectedTable(true);
                        app.getSelectedTree().getSelectionModel().select(node.parentNode);
                        node.remove();
                    });
                }
            }, {
                text   : 'Truncate Database',
                handler: function() {

                    var db = app.getSelectedDatabase();
                    app.truncateDatabase(db, function() {

                        var node = app.getSelectedTable(true);
                        Ext.Array.each(node.childNodes, function(childNode, idx) {

                            childNode.removeAll();
                        });
                    });
                }
            }, {
                text   : 'Empty Database',
                handler: function() {

                    var db = app.getSelectedDatabase();
                    app.emptyDatabase(db);
                }
            }
        ];
    },

    loadTablesContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Refresh Tables',
            scope  : app,
            handler: function() {

                app.reloadTree();
            }
        }, {
            text   : 'Create Table',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase();
                app.openCreateTableWindow(db);
            }
        }, {
            text   : 'Copy Table(s) To Differnt Host/Database',
            handler: function() {

                app.openCopyDatabaseWindow();
            }
        }];
    },

    loadTableContextMenu: function() {

        var app = this.getApplication();

        return [{
            text     : 'Paste SQL Statement',
            defaults : {
                scope: this
            },
            listeners: {
                scope   : this,
                activate: function(menu) {

                    var subTab = app.getActiveQueryTab();
                    Ext.Object.each(menu.menu.items.items, function(idx, obj) {
                        obj[subTab ? 'enable' : 'disable']();
                    });
                }
            },
            menu     : [{
                text   : 'INSERT INTO &lt;Table Name&gt;..',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.pasteSQLStatement(db, table, 'insert');
                }
            }, {
                text   : 'UPDATE &lt;Table Name&gt; SET..',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.pasteSQLStatement(db, table, 'update');
                }
            }, {
                text   : 'DELETE FROM &lt;Table Name&gt;..',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.pasteSQLStatement(db, table, 'delete');
                }
            }, {
                text   : 'SELECT &lt;col-1&gt;..&lt;col-n&gt; FROM &lt;Table Name&gt;',
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
            text   : 'Copy Table(s) To Differnt Host/Database',
            handler: function() {

                app.openCopyDatabaseWindow();
            }
        }, {
            xtype: 'menuseparator'
        }, {
            text   : 'Open Table',
            handler: function() {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedNode();

                app.openTable(db, table);
            }
        }, {
            text   : 'Count Table',
            handler: function() {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedNode();

                app.countTable(db, table);
            }
        }, {
            text   : 'Create Table',
            handler: function() {

                var db = app.getSelectedDatabase();
                app.openCreateTableWindow(db);
            }
        }, {
            text   : 'Alter Table',
            handler: function() {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedTable();

                app.openAlterTableWindow(db, table);
            }
        }, {
            text: 'More Table Operations',
            menu: [{
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
                        table = app.getSelectedTable();

                    app.openReorderColumns(db, table);
                }
            }, {
                text   : 'Duplicate Table Structure/Data',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.duplicateTable(db, table, function() {

                        var node = app.getSelectedTable(true);
                        app.getSelectedTree().getSelectionModel().select(node.parentNode);
                        app.reloadTree();
                    });
                }
            }, {
                text   : 'Copy Table Structure/Data To Other Database',
                handler: function() {

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    app.duplicateTable(db, table, function() {

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
                    }, {

                        text   : 'MRG_MYISAM',
                        handler: function(btn) {
                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    }, {
                        text   : 'CSV',
                        handler: function(btn) {
                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    }, {
                        text   : 'BLACKHOLE',
                        handler: function(btn) {
                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    }, {
                        text   : 'MEMORY',
                        handler: function(btn) {
                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    }, {
                        text   : 'FEDERATED',
                        handler: function(btn) {
                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    }, {

                        text   : 'ARCHIVE',
                        handler: function(btn) {
                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    }, {
                        text   : 'INNODB',
                        handler: function(btn) {
                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    }, {
                        text   : 'PERFORMANCE_SCHEMA',
                        handler: function(btn) {

                            app.changeTableToType(app.getSelectedDatabase(), app.getSelectedNode(), btn.text);
                        }
                    }
                ]
            }]
        }, {
            xtype: 'menuseparator'
        }, {
            text   : 'Create Trigger',
            handler: function(){

                var db = app.getSelectedDatabase();
                app.createTrigger(db);
            }
        }];
    },

    loadViewsContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Refresh Views',
            scope  : app,
            handler: app.reloadTree
        }, {
            text   : 'Create View',
            handler: function(){

                var db = app.getSelectedDatabase();
                app.createView(db);
            }
        }];
    },

    loadViewContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Create View',
            handler: function(){

                var db = app.getSelectedDatabase();
                app.createView(db);
            }
        }, {
            text   : 'Alter View',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    view = app.getSelectedNode();

                app.alterView(db, view);
            }
        }, {
            text   : 'Drop View',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    view = app.getSelectedNode();
                app.dropView(db, view, function(){

                    var node = app.getSelectedNode(true);
                    this.getSelectedTree().getSelectionModel().select(node.parentNode);
                    node.remove();
                });
            }
        }, {
            text   : 'Open View',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedNode();

                app.openTable(db, table);
            }
        }, {
            text   : 'Rename View',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    view = app.getSelectedNode();

                app.renameView(db, view, function(){

                    var node = app.getSelectedNode(true);
                    app.getSelectedTree().getSelectionModel().select(node.parentNode);
                    app.reloadTree();
                });
            }
        }, {
            text   : 'Export View',
            scope  : app,
            handler: function() {

            }
        }];
    },

    loadEventsContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Refresh Events',
            scope  : app,
            handler: app.reloadTree
        }, {
            text   : 'Create Event',
            handler: function() {

                var db = app.getSelectedDatabase();
                app.createEvent(db);
            }
        }];
    },

    loadEventContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Create Event',
            handler: function() {

                var db = app.getSelectedDatabase();
                app.createEvent(db);
            }
        }, {
            text   : 'Alter Event',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    event = app.getSelectedNode();

                app.alterEvent(db, event);
            }
        }, {
            text   : 'Drop Event',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    event = app.getSelectedNode();

                app.dropEvent(db, event, function(){

                    var node = app.getSelectedNode(true);
                    app.getSelectedTree().getSelectionModel().select(node.parentNode);
                    node.remove();
                });
            }
        }, {
            text   : 'Rename Event',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    event = app.getSelectedNode();

                app.renameEvent(db, event, function(){

                    var node = app.getSelectedNode(true);
                    app.getSelectedTree().getSelectionModel().select(node.parentNode);
                    app.reloadTree();
                });
            }
        }];
    },

    loadTriggersContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Refresh Triggers',
            handler: app.reloadTree
        }, {
            text   : 'Create Trigger',
            handler: function(){

                var db = app.getSelectedDatabase();
                app.createTrigger(db);
            }
        }];
    },

    loadTriggerContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Create Trigger',
            scope  : app,
            handler: function(){

                var db = app.getSelectedDatabase();
                app.createTrigger(db);
            }
        }, {
            text   : 'Alter Trigger',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    trigger = app.getSelectedNode();

                app.alterTrigger(db, trigger.match(/.+?\b/)[0]);
            }
        }, {
            text   : 'Drop Trigger',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    trigger = app.getSelectedNode();

                app.dropTrigger(db, trigger, function(){

                    var node = app.getSelectedNode(true);
                    this.getSelectedTree().getSelectionModel().select(node.parentNode);
                    node.remove();
                });
            }
        }, {
            text   : 'Rename Trigger',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    trigger = app.getSelectedNode();
                app.renameTrigger(db, trigger, function(){

                    var node = app.getSelectedNode(true);
                    app.getSelectedTree().getSelectionModel().select(node.parentNode);
                    app.reloadTree();
                });
            }
        }];
    },

    loadFunctionsContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Refresh Functions',
            scope  : app,
            handler: app.reloadTree
        }, {
            text   : 'Create Function',
            handler: function(){

                var db = app.getSelectedDatabase();
                app.createFunction(db);
            }
        }];
    },

    loadFunctionContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Create Function',
            scope  : app,
            handler: function(){

                var db = app.getSelectedDatabase();
                app.createFunction(db);
            }
        }, {
            text   : 'Alter Function',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    func = app.getSelectedNode();

                app.alterFunction(db, func);
            }
        }, {
            text   : 'Drop Function',
            scope  : app,
            handler: function() {

                var db = app.getSelectedDatabase(),
                    func = app.getSelectedNode();

                app.dropFunction(db, func, function(){

                    var node = app.getSelectedNode(true);
                    app.getSelectedTree().getSelectionModel().select(node.parentNode);
                    node.remove();
                });
            }
        }];
    },

    loadProceduresContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Refresh Procedures',
            scope  : app,
            handler: app.reloadTree
        }, {
            text   : 'Create Procedure',
            handler: function(){

                var db = app.getSelectedDatabase();
                app.createProcedure(db);
            }
        }];
    },

    loadProcedureContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Create Procedure',
            handler: function(){

                var db = app.getSelectedDatabase();
                app.createProcedure(db);
            }
        }, {
            text   : 'Alter Procedure',
            handler: function() {

                var db = app.getSelectedDatabase(),
                    procedure = app.getSelectedNode();

                app.alterProcedure(db, procedure);
            }
        }, {
            text   : 'Drop Procedure',
            handler: function() {

                var db = app.getSelectedDatabase(),
                    procedure = app.getSelectedNode();

                app.dropProcedure(db, procedure, function(){

                    var node = app.getSelectedNode(true);
                    app.getSelectedTree().getSelectionModel().select(node.parentNode);
                    node.remove();
                });
            }
        }];
    }

});

