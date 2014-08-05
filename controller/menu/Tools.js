Ext.define('Planche.controller.menu.Tools', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'Process List',
            scope : this.application,
            handler : function(){

                this.openProcessPanel();
            }
        }]);

        this.added = true;
    },

    show : function(topBtn){

        if(!this.added){

            this.add(topBtn);
        }

        topBtn.menu.showBy(topBtn);
    }
});
