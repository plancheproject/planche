Ext.define('Planche.controller.menu.Database', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        var app = this.getApplication();

        topBtn.menu.add([{
            text        : 'Copy Database To Different Host/Database',
            handler     : function() {

                app.openCopyDatabaseWindow();
            },
            allowDisable: function() {

                if (app.getSelectedDatabase()) {

                    return false;
                }

                return true;
            }
        }, {
            text        : 'Create Database',
            handler     : function() {

                app.createDatabase();
            },
            allowDisable: function() {

                if (!app.getActiveConnectTab()) {

                    return true;
                }

                return false;
            }
        }, {
            text        : 'Alter Database',
            handler     : function() {

                var db = app.getSelectedDatabase();
                app.alterDatabase(db);
            },
            allowDisable: function() {

                if (app.getSelectedDatabase()) {

                    return false;
                }

                return true;
            }
        }, {
            text        : 'Create',
            allowDisable: function() {

                var node = app.getSelectedNode(true);
                var db = app.getParentNode(node);

                if (!db) {

                    return true;
                }

                return false;
            },
            menu        : [{
                text   : 'Table',
                handler: function() {

                    var db = app.getSelectedDatabase();
                    app.openCreateTableWindow(db);
                }
            }, {
                text   : 'View',
                handler: function() {

                    var db = app.getSelectedDatabase();
                    app.createView(db);
                }
            }, {
                text   : 'Stored Procedure',
                handler: function() {

                    var db = app.getSelectedDatabase();
                    app.createProcedure(db);
                }
            }, {
                text   : 'Function',
                handler: function() {

                    var db = app.getSelectedDatabase();
                    app.createFunction(db);
                }
            }, {
                text   : 'Trigger',
                handler: function() {

                    var db = app.getSelectedDatabase();
                    app.createTrigger(db);
                }
            }, {
                text   : 'Event',
                handler: function() {

                    var db = app.getSelectedDatabase();
                    app.createEvent(db);
                }
            }]
        }, {
            text        : 'More Database Operations',
            allowDisable: function() {

                if (app.getSelectedDatabase()) {

                    return false;
                }

                return true;
            },
            menu        : [{
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
            }]
        }]);

        this.added = true;
    }
});