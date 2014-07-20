Ext.define('Planche.controller.menu.Database', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'Copy Database To Different Host/Database',
            hidden : function(){

                return false;
            }()
        },{
            text : 'Create Database'
        },{
            text : 'Alter Database'
        },{
            text : 'Create'
        },{
            text : 'More Database Operations'
        },{
            text : 'Backup/Export',
            menu : [{
                text : 'Backup Database As SQL Dump'
            }]
        },{
            text : 'Import',
            menu : [{
                text : 'Import External Data'
            },{
                text : 'Execute SQL Script'
            }]
        },{
            text : 'Create Schema For Database In HTML'
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