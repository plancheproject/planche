Ext.define('Planche.controller.table.EditSchemaWindow', {
    extend: 'Ext.app.Controller',
    views : [
        'table.EditSchemaWindow',
        'table.TableSchemaTab',
        'table.TablePropertiesTab',
        'table.TableIndexesTab',
        'table.TableSQLTab',
        'table.TableInfoTab'
    ],
    init  : function() {

        this.control({
            '#edit-schema-btn-close': {
                'click': this.cancel
            }
        });
    },

    initWindow: function(db, tb, openTab) {

        var title = (tb ? 'Alter Table \'' + tb + '\' in \'' + db + '\'' : 'Create new table');
        Ext.create('Planche.view.table.EditSchemaWindow', {
            title    : title,
            items    : this.initTabPanel(db, tb),
            listeners: {
                boxready: function(win) {

                    if (!tb) {

                        Ext.invoke(win.query('table-properties-tab, table-indexes-tab, table-sql-tab, table-info-tab'), 'setDisabled', true);
                    }

                    if(openTab){

                        var tab = win.down(openTab);
                        tab.show();
                    }
                }
            }
        });
    },

    initTabPanel: function(db, tb) {

        return {
            xtype: 'tabpanel',
            items: [
                this.initTableSchemaTab(db, tb),
                this.initTablePropertiesTab(db, tb),
                this.initTableIndexexTab(db, tb),
                this.initTableSQLTab(db, tb),
                this.initTableInfoTab(db, tb)
            ]
        }
    },

    initTableSchemaTab: function(db, tb) {

        return {
            xtype      : 'table-schema-tab',
            application: this.getApplication(),
            database   : db,
            table      : tb
        }
    },

    initTablePropertiesTab: function(db, tb) {

        return {
            xtype      : 'table-properties-tab',
            application: this.getApplication(),
            database   : db,
            table      : tb
        }
    },

    initTableIndexexTab: function(db, tb) {

        return {
            xtype      : 'table-indexes-tab',
            application: this.getApplication(),
            database   : db,
            table      : tb
        }
    },

    initTableSQLTab: function(db, tb) {

        return {
            xtype      : 'table-sql-tab',
            application: this.getApplication(),
            database   : db,
            table      : tb
        }
    },

    initTableInfoTab: function(db, tb) {

        return {
            xtype      : 'table-info-tab',
            application: this.getApplication(),
            database   : db,
            table      : tb
        }
    },

    cancel: function(btn) {

        var tab = Ext.getCmp('table-schema-tab');
        if (tab.getEdited()) {

            Ext.Msg.confirm('Cancel', 'You will lose all changes. Do you want to quit?', function(btn, text) {

                if (btn == 'yes') {

                    this.up('window').destroy();
                }
            }, btn);
        }
        else {

            btn.up('window').destroy();
        }
    }
});