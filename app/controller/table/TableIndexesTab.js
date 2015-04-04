Ext.define('Planche.controller.table.TableIndexesTab', {
    extend: 'Ext.app.Controller',
    views : [
        'table.TableIndexesTab'
    ],
    init : function(){
        
        this.control({
            'table-indexes-tab' : {
                boxready  : this.initTab
            },
            '#table-indexes-btn-create' : {
                click : this.createIndex
            },
            '#table-indexes-btn-edit' : {
                click : this.editIndex
            },
            '#table-indexes-btn-delete' : {
                click : this.deleteIndex
            }
        });
    },

    createIndex : function(btn){

    },

    editIndex : function(btn){

        var 
        app      = this.getApplication(),
        tab      = Ext.getCmp('table-indexes-tab'),
        db       = tab.getDatabase(),
        tb       = tab.getTable(),
        selModel = tab.getSelectionModel(),
        selList  = selModel.getSelection(); 

        if(selList.length == 0) {

            app.showMessage('Choose the index you want to edit.');
            return;
        }
    },

    deleteIndex : function(btn){

        var 
        app      = this.getApplication(),
        tab      = Ext.getCmp('table-indexes-tab'),
        db       = tab.getDatabase(),
        tb       = tab.getTable(),
        selModel = tab.getSelectionModel(),
        selList  = selModel.getSelection(); 

        if(selList.length == 0) {

            app.showMessage('Choose the index you want to delete.');
            return;
        }

        var index = selList[0].raw.Key_name;
        Ext.Msg.confirm('Drop Index \''+index+'\'', 'Do you really want to drop the index?\n\nWarning: You will lose all data!', function(btn, text){

            if (btn == 'yes'){

                app.tunneling({
                    db : db,
                    query : app.getAPIS().getQuery('DROP_INDEX', db, tb, index),
                    success : function(config, response){

                        tab.reload();
                    }
                });
            }
        });
    },

    initTab : function(tab){

        var 
        app = this.getApplication(),
        db  = tab.getDatabase(),
        tb  = tab.getTable();

        if(!tb){

            return;
        }

        //load table fileds list
        app.tunneling({
            db : db,
            query : app.getAPIS().getQuery('SHOW_INDEX', db, tb),
            success : function(config, response){

                var records = app.getAssocArray(response.fields, response.records);
                tab.getStore().loadData(records);
            }
        });
    }
});