Ext.define('Planche.controller.table.EditIndexWindow', {
    extend: 'Ext.app.Controller',
    views : [
    ],
    init : function(){

        this.control({
            '#edit-index-btn-close' : {
                'click' : this.cancel
            }
        });
    },

    initWindow : function(db, tb, index){

        var title = (tb ? 'Alter Index \''+index+'\' in `'+db+'`.`'+tb+'`' : 'Create new index');
        Ext.create('Planche.view.table.EditIndexWindow', {
            title: title
        });
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