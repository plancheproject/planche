Ext.define('Planche.controller.layout.SchemeTreeContextMenu', {
    extend: 'Ext.app.Controller',
    init  : function() {

        this.control({
            'scheme-tree': {
                'itemcontextmenu': this.initContextMenu
            }
        });
    },

    initContextMenu: function(view, record, item, index, e, eOpts) {

        //서버트리의 이벤트를 잡아 내서 node위에서 right click을 했을 경우만 
        //context메뉴를 보여준다.
        e.preventDefault();

        var app = this.getApplication(),
            menu = app.getSchemeContextMenu(),
            node = app.getSelectedNode(),
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
                handler: app.reloadTree
            },
            {
                text   : 'Create Database',
                handler: app.createDatabase
            }, {
                text   : 'Alter Database',
                handler: function() {

                    var node = app.getSelectedNode();
                    app.alterDatabase(node);
                }
            },
            {
                text   : 'Drop Database',
                handler: function() {

                    var node = app.getSelectedNode();
                    app.dropDatabase(node);
                }
            }, {
                text   : 'Truncate Database',
                handler: function() {

                    var node = app.getSelectedNode();
                    app.truncateDatabase(node);
                }
            }, {
                text   : 'Empty Database',
                handler: function() {

                    var node = app.getSelectedNode();
                    app.emptyDatabase(node);
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

                app.openCreateTableWindow();
            }
        }, {
            text    : 'Copy Table(s) To Differnt Host/Database',
            disabled: true,
            handler : function() {

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
                scope  : this,
                handler: function() {

                    var node = app.getSelectedNode();
                    app.pasteSQLStatement('insert', node);
                }
            }, {
                text   : 'UPDATE &lt;Table Name&gt; SET..',
                scope  : this,
                handler: function() {

                    var node = app.getSelectedNode();
                    app.pasteSQLStatement('update', node);
                }
            }, {
                text   : 'DELETE FROM &lt;Table Name&gt;..',
                scope  : this,
                handler: function() {

                    var node = app.getSelectedNode();
                    app.pasteSQLStatement('delete', node);
                }
            }, {
                text   : 'SELECT &lt;col-1&gt;..&lt;col-n&gt; FROM &lt;Table Name&gt;',
                scope  : this,
                handler: function() {

                    var node = app.getSelectedNode();
                    app.pasteSQLStatement('select', node);
                }
            }]
        }, {
            text    : 'Copy Table(s) To Differnt Host/Database',
            disabled: true,
            handler : function() {

            }
        }, {
            xtype: 'menuseparator'
        }, {
            text   : 'Open Table',
            handler: function() {

                app.openTable(app.getSelectedNode());
            }
        }, {
            text   : 'Create Table',
            handler: function() {

                app.openCreateTableWindow();
            }
        }, {
            text   : 'Alter Table',
            scope  : this,
            handler: function() {

                var node = app.getSelectedNode();
                app.openAlterTableWindow(node);
            }
        }, {
            text: 'More Table Operations',
            menu: [{
                text   : 'Rename Table',
                scope  : this,
                handler: function() {

                    var node = app.getSelectedNode();
                    app.renameTable(node);
                }
            }, {
                text   : 'Truncate Table',
                scope  : this,
                handler: function() {

                    var node = app.getSelectedNode();
                    app.truncateTable(node);
                }
            }, {
                text   : 'Drop Table From Database',
                scope  : this,
                handler: function() {

                    var node = app.getSelectedNode();
                    app.dropTable(node);
                }
            }, {
                text   : 'Reorder Column(s)',
                scope  : this,
                handler: function() {

                    var node = app.getSelectedNode();
                    app.openReorderColumns(node);
                }
            }, {
                text    : 'Duplicate Table Structure/Data',
                scope   : this,
                disabled: true,
                handler : function() {

                }
            }, {
                text   : 'View Advanced Properties',
                scope  : this,
                handler: function() {

                    var node = app.getSelectedNode();
                    app.openAdvancedProperties(node);
                }
            }, {
                text: 'Change Table To Type',
                menu: [
                    {
                        scope  : this,
                        text   : 'MYISAM',
                        handler: function(btn) {
                            app.changeTableToType(btn.text);
                        }
                    }, {
                        scope  : this,
                        text   : 'MRG_MYISAM',
                        handler: function(btn) {
                            app.changeTableToType(btn.text);
                        }
                    }, {
                        scope  : this,
                        text   : 'CSV',
                        handler: function(btn) {
                            app.changeTableToType(btn.text);
                        }
                    }, {
                        scope  : this,
                        text   : 'BLACKHOLE',
                        handler: function(btn) {
                            app.changeTableToType(btn.text);
                        }
                    }, {
                        scope  : this,
                        text   : 'MEMORY',
                        handler: function(btn) {
                            app.changeTableToType(btn.text);
                        }
                    }, {
                        scope  : this,
                        text   : 'FEDERATED',
                        handler: function(btn) {
                            app.changeTableToType(btn.text);
                        }
                    }, {
                        scope  : this,
                        text   : 'ARCHIVE',
                        handler: function(btn) {
                            app.changeTableToType(btn.text);
                        }
                    }, {
                        scope  : this,
                        text   : 'INNODB',
                        handler: function(btn) {
                            app.changeTableToType(btn.text);
                        }
                    }, {
                        scope  : this,
                        text   : 'PERFORMANCE_SCHEMA',
                        handler: function(btn) {

                            app.changeTableToType(btn.text);
                        }
                    }
                ]
            }]
        }, {
            xtype: 'menuseparator'
        }, {
            text   : 'Create Trigger',
            handler: function() {

                var node = app.getSelectedNode();
                app.createTrigger(node);
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
            scope  : app,
            handler: app.createView
        }];
    },

    loadViewContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Create View',
            scope  : app,
            handler: app.createView
        }, {
            text   : 'Alter View',
            scope  : app,
            handler: function() {

                var node = this.getSelectedNode();
                app.alterView(node);
            }
        }, {
            text   : 'Drop View',
            scope  : app,
            handler: function() {

                var node = this.getSelectedNode();
                app.dropView(node);
            }
        }, {
            text   : 'Open View',
            scope  : app,
            handler: function() {

                var node = this.getSelectedNode();
                app.openTable(node);
            }
        }, {
            text   : 'Rename View',
            scope  : app,
            handler: function() {

                var node = this.getSelectedNode();
                app.renameView(node);
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
            scope  : app,
            handler: app.createEvent
        }];
    },

    loadEventContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Create Event',
            scope  : app,
            handler: app.createEvent
        }, {
            text   : 'Alter Event',
            scope  : app,
            handler: function(){

                var node = this.getSelectedNode();
                app.alterEvent(node);
            }
        }, {
            text   : 'Drop Event',
            scope  : app,
            handler: function(){

                var node = this.getSelectedNode();
                app.dropEvent(node);
            }
        }, {
            text   : 'Rename Event',
            scope  : app,
            handler: function(){

                var node = this.getSelectedNode();
                app.renameEvent(node);
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
            scope  : app,
            handler: app.createTrigger
        }];
    },

    loadTriggerContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Create Trigger',
            scope  : app,
            handler: app.createTrigger
        }, {
            text   : 'Alter Trigger',
            scope  : app,
            handler: function(){

                var node = this.getSelectedNode();
                app.alterTrigger(node);
            }
        }, {
            text   : 'Drop Trigger',
            scope  : app,
            handler: function(){

                var node = this.getSelectedNode();
                app.dropTrigger(node);
            }
        }, {
            text   : 'Rename Trigger',
            scope  : app,
            handler: function(){

                var node = this.getSelectedNode();
                app.renameTrigger(node);
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
            scope  : app,
            handler: app.createFunction
        }];
    },

    loadFunctionContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Create Function',
            scope  : app,
            handler: app.createFunction
        }, {
            text   : 'Alter Function',
            scope  : app,
            handler: function(){

                var node = this.getSelectedNode();
                app.alterFunction(node);
            }
        }, {
            text   : 'Drop Function',
            scope  : app,
            handler: function(){

                var node = this.getSelectedNode();
                app.dropFunction(node);
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
            scope  : app,
            handler: app.createProcedure
        }];
    },

    loadProcedureContextMenu: function() {

        var app = this.getApplication();

        return [{
            text   : 'Create Procedure',
            scope  : app,
            handler: app.createProcedure
        }, {
            text   : 'Alter Procedure',
            scope  : app,
            handler: function(){

                var node = this.getSelectedNode();
                app.alterProcedure(node);
            }
        }, {
            text   : 'Drop Procedure',
            scope  : app,
            handler: function(){

                var node = this.getSelectedNode();
                app.dropProcedure(node);
            }
        }];
    }

});

