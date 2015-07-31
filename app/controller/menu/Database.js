Ext.define('Planche.controller.menu.Database', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        topBtn.menu.add([{
            text        : 'Copy Database To Different Host/Database',
            scope       : this.application,
            handler     : function() {

                this.openCopyDatabaseWindow();
            },
            allowDisable: function() {

                if (this.getSelectedDatabase()) {

                    return false;
                }

                return true;
            }
        }, {
            text        : 'Create Database',
            scope       : this.application,
            handler     : function() {

                this.createDatabase();
            },
            allowDisable: function() {

                if (!this.getActiveConnectTab()) {

                    return true;
                }

                return false;
            }
        }, {
            text        : 'Alter Database',
            scope       : this.application,
            handler     : function() {

                var node = this.getSelectedDatabase(true);
                this.alterDatabase(node);
            },
            allowDisable: function() {

                if (this.getSelectedDatabase()) {

                    return false;
                }

                return true;
            }
        }, {
            text        : 'Create',
            scope       : this.application,
            allowDisable: function() {

                var node = this.getSelectedNode();
                var db = this.getParentNode(node);

                if (!db) {

                    return true;
                }

                return false;
            },
            menu        : [{
                text   : 'Table',
                scope  : this.application,
                handler: function() {

                    this.openCreateTableWindow();
                }
            }, {
                text   : 'View',
                scope  : this.application,
                handler: function() {

                    this.createView();
                }
            }, {
                text   : 'Stored Procedure',
                scope  : this.application,
                handler: function() {

                    this.createProcedure();
                }
            }, {
                text   : 'Function',
                scope  : this.application,
                handler: function() {

                    this.createfunction();
                }
            }, {
                text   : 'Trigger',
                scope  : this.application,
                handler: function() {

                    this.createTrigger();
                }
            }, {
                text   : 'Event',
                scope  : this.application,
                handler: function() {

                    this.createEvent();
                }
            }]
        }, {
            text        : 'More Database Operations',
            scope       : this.application,
            allowDisable: function() {

                if (this.getSelectedDatabase()) {

                    return false;
                }

                return true;
            },
            menu        : [{
                text   : 'Drop Database',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedDatabase(true);
                    this.dropDatabase(node);
                }
            }, {
                text   : 'Truncate Database',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedDatabase(true);
                    this.truncateDatabase(node);
                }
            }, {
                text   : 'Empty Database',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedDatabase(true);
                    this.emptyDatabase(node);
                }
            }

            ]
        }, '-', {
            text    : 'Backup Database As SQL Dump(Not Yet)',
            disabled: true,
            menu    : [{
                text: ''
            }]
        }, {
            text    : 'Import(Not Yet)',
            disabled: true,
            menu    : [{
                text: 'Import External Data'
            }, {
                text: 'Execute SQL Script'
            }]
        }, '-', {
            text        : 'Export Database Schema To HTML',
            scope       : this.application,
            allowDisable: function() {

                if (this.getSelectedDatabase()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                this.openSchemaToHTMLWindow();
            }
        }, '-', {
            text        : 'Download To CSV',
            scope       : this.application,
            allowDisable: function() {

                if (this.getSelectedDatabase()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                this.openSchemaToCSVWindow();
            }
        }]);

        this.added = true;
    }
});