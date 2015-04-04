Ext.define('Planche.controller.table.TablePropertiesTab', {
    extend: 'Ext.app.Controller',
    views : [
        'table.TablePropertiesTab'
    ],
    init : function(){
        
        this.control({
            'table-properties-tab' : {
                boxready  : this.initTab
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
            query : app.getAPIS().getQuery('SHOW_TABLE_STATUS', db, tb),
            success : function(config, response){

                console.log(response.records);
            }
        });
    }
});