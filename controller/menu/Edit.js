Ext.define('Planche.controller.menu.Edit', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'New Connection Using Current Setting',
            disable : function(){

                return false;
            }
        },{
            text : 'New Connection'
        },{
            text : 'New Query Editor'
        },{
            text : 'Close Tab',
            disable : function(){

                console.log('sdf');
                return false;
            }
        },{
            text : 'Close Other Tabs'
        },{
            text : 'Disconnect'
        },{
            text : 'Disconnect All'
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