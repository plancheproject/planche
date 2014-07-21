Ext.define('Planche.controller.menu.Edit', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'Refresh Object Browser'
        },{
            text : 'Excute Query'
        },
        '-'
        ,{
            text : 'SQL Formatter'
        },
        '-'
        ,{
            text : 'Undo'
        },{
            text : 'Redo'
        },
        '-'
        ,{
            text : 'Cut'
        },{
            text : 'Copy'
        },{
            text : 'Paste'
        },
        '-'
        ,{
            text : 'Find'
        },{
            text : 'Find Next'
        },{
            text : 'Replace'
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