Ext.define('Planche.controller.menu.Table', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        topBtn.menu.add([{
            text        : 'Paste SQL Statement',
            scope       : this.application,
            allowDisable: function(topBtn, menu) {

                if (this.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            menu        : [{
                text   : 'INSERT INTO &lt;Table Name&gt;..',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedNode();
                    this.pasteSQLStatement('insert', node);
                }
            }, {
                text   : 'UPDATE &lt;Table Name&gt; SET..',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedNode();
                    this.pasteSQLStatement('update', node);
                }
            }, {
                text   : 'DELETE FROM &lt;Table Name&gt;..',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedNode();
                    this.pasteSQLStatement('delete', node);
                }
            }, {
                text   : 'SELECT &lt;col-1&gt;..&lt;col-n&gt; FROM &lt;Table Name&gt;',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedNode();
                    this.pasteSQLStatement('select', node);
                }
            }]
        }, {
            text        : 'Copy Table To Differnt Host/Database',
            scope       : this.application,
            allowDisable: function(topBtn, menu) {

                if (this.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var node = this.getSelectedNode();
                this.openCopyDatabaseWindow(node);
            }
        }, '-', {
            text        : 'Open Table',
            scope       : this.application,
            allowDisable: function(topBtn, menu) {

                if (this.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var node = this.getSelectedNode();
                this.openTable(node);
            }
        }, {
            text        : 'Create Table',
            scope       : this.application,
            allowDisable: function(topBtn, menu) {

                if (this.getSelectedDatabase()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                this.openCreateTableWindow();
            }
        }, {
            text        : 'Alter Table',
            scope       : this.application,
            allowDisable: function(topBtn, menu) {

                if (this.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var node = this.getSelectedTable(true);
                this.openAlterTableWindow(node);
            }
        }, {
            text        : 'Manage Indexes',
            scope       : this.application,
            allowDisable: function(topBtn, menu) {

                if (this.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var node = this.getSelectedTable(true);
                this.openAlterTableWindow(node);
            }
        }, {
            text        : 'More Table Operations',
            scope       : this.application,
            allowDisable: function(topBtn, menu) {

                if (this.getSelectedTable()) {

                    return false;
                }

                return true;
            },
            menu        : [{
                text   : 'Rename Table',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedTable(true);
                    this.renameTable(node);
                }
            }, {
                text   : 'Truncate Table',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedTable(true);
                    this.truncateTable(node);
                }
            }, {
                text   : 'Drop Table From Database',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedTable(true);
                    this.dropTable(node);
                }
            }, {
                text   : 'Reorder Column(s)',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedTable(true);
                    this.openReorderColumns(node);
                }
            }, {
                text   : 'Duplicate Table Structure/Data',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedNode();
                    this.duplicateTable(node);
                }
            }, {
                text   : 'View Advanced Properties',
                scope  : this.application,
                handler: function() {

                    var node = this.getSelectedTable(true);
                    this.openAdvancedProperties(node);
                }
            }, {
                text: 'Change Table To Type',
                menu: [
                    {
                        scope  : this.application,
                        text   : 'MYISAM',
                        handler: function(btn) {

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope  : this.application,
                        text   : 'MRG_MYISAM',
                        handler: function(btn) {

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope  : this.application,
                        text   : 'CSV',
                        handler: function(btn) {

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope  : this.application,
                        text   : 'BLACKHOLE',
                        handler: function(btn) {

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope  : this.application,
                        text   : 'MEMORY',
                        handler: function(btn) {

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope  : this.application,
                        text   : 'FEDERATED',
                        handler: function(btn) {

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope  : this.application,
                        text   : 'ARCHIVE',
                        handler: function(btn) {

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope  : this.application,
                        text   : 'INNODB',
                        handler: function(btn) {

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope  : this.application,
                        text   : 'PERFORMANCE_SCHEMA',
                        handler: function(btn) {

                            this.changeTableToType(btn.text);
                        }
                    }
                ]
            }]
        }, '-', {
            text        : 'Create Trigger',
            disabled    : true,
            scope       : this.application,
            allowDisable: function() {

                if (this.getSelectedDatabase()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                var node = this.getSelectedDatabase(true);
                this.createTrigger(node);
            }
        }]);

        this.added = true;
    }
});