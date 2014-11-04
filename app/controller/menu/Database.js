Ext.define('Planche.controller.menu.Database', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'Copy Database To Different Host/Database(Not Yet)',
            disabled : true
        },{
            text : 'Create Database',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                if(!this.getActiveMainTab()){

                    return true;
                }

                return false;
            }
        },{
            text : 'Alter Database',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                if(!this.getActiveMainTab()){

                    return true;
                }

                return false;
            }
        },{
            text : 'Create',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                var node = this.getSelectedNode();
                var db = this.getParentNode(node);

                if(!db){

                    return true;
                }

                return false;
            },
            menu : [{
                text : 'Table'
            },{
                text : 'View'
            },{
                text : 'Stored Procedure'
            },{
                text : 'Function'
            },{
                text : 'Trigger'
            },{
                text : 'Trigger'
            }]
        },{
            text : 'More Database Operations',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                var node = this.getSelectedNode();
                var db = this.getParentNode(node);

                if(!db){

                    return true;
                }

                return false;
            },
            menu : [{
                text : 'Drop Database'
            },{
                text : 'Truncate Database'
            },{
                text : 'Empty Database'
            }]
        },{
            text : 'Backup/Export(Not Yet)',
            disabled : true,
            menu : [{
                text : 'Backup Database As SQL Dump'
            }]
        },{
            text : 'Import(Not Yet)',
            disabled : true,
            menu : [{
                text : 'Import External Data'
            },{
                text : 'Execute SQL Script'
            }]
        },{
            text : 'Create Schema For Database In HTML(Not Yet)',
            disabled : true,
        }]);

        this.added = true;
    },

    show : function(topBtn){

        if(!this.added){

            this.add(topBtn);
        }

        Ext.Array.each(topBtn.menu.query('menuitem'), function(menu, idx){
            
            switch(typeof menu.allowDisable){

                case 'function':

                    menu.setDisabled(menu.allowDisable.apply(menu.scope || menu, [topBtn, menu]));
                    break;

                case 'boolean' :

                    menu.setDisabled(menu.allowDisable);
                    break;
            }
        });

        topBtn.menu.showBy(topBtn);
    }
});