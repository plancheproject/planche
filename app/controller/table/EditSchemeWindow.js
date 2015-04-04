Ext.define('Planche.controller.table.EditSchemeWindow', {
    extend: 'Ext.app.Controller',
    views : [
        'table.EditSchemeWindow',
        'table.TableSchemeTab',
        'table.TablePropertiesTab',
        'table.TableIndexesTab',
        'table.TableSQLTab',
        'table.TableInfoTab'
    ],
    init : function(){

        this.control({
            '#edit-scheme-btn-close' : {
                'click' : this.cancel
            }
        });
    },

    initWindow : function(db, tb){

        var title = (tb ? 'Alter Table \''+tb+'\' in \''+db+'\'' : 'Create new table');
        Ext.create('Planche.view.table.EditSchemeWindow', {
            title: title,
            items: this.initTabPanel(db, tb)
        });
    },

    initTabPanel : function(db, tb){

        return {
            xtype : 'tabpanel',
            items : [
                this.initTableSchemeTab(db, tb),
                this.initTablePropertiesTab(db, tb),
                this.initTableIndexexTab(db, tb),
                this.initTableSQLTab(db, tb),
                this.initTableInfoTab(db, tb)
            ]
        }
    },

    initTableSchemeTab : function(db, tb){

        return {
            xtype      : 'table-scheme-tab',
            application: this.getApplication(),
            database   : db,
            table      : tb
        }
    },

    initTablePropertiesTab : function(db, tb){

        return {
            xtype      : 'table-properties-tab',
            application: this.getApplication(),
            database   : db,
            table      : tb
        }
    },

    initTableIndexexTab : function(db, tb){

        return {
            xtype      : 'table-indexes-tab',
            application: this.getApplication(),
            database   : db,
            table      : tb
        }
    },

    initTableSQLTab : function(db, tb){

        return {
            xtype      : 'table-sql-tab',
            application: this.getApplication(),
            database   : db,
            table      : tb
        }
    },

    initTableInfoTab : function(db, tb){

        return {
            xtype      : 'table-info-tab',
            application: this.getApplication(),
            database   : db,
            table      : tb
        }
    },

    cancel : function(btn){

        var tab = Ext.getCmp('table-scheme-tab');
        if(tab.getEdited()){

            Ext.Msg.confirm('Cancel', 'You will lose all changes. Do you want to quit?', function(btn, text){

                if (btn == 'yes'){

                    this.up('window').destroy();
                }
            }, btn);
        }
        else {

            btn.up('window').destroy();
        }
    }
});