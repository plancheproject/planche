Ext.define('Planche.controller.menu.Database', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'Copy Database To Different Host/Database(Not Yet)',
            disabled : true
        },

        // {
        //     text : 'Create Database',
        //     scope : this.application,
        //     handler : function(){

        //         this.createDatabase();
        //     },
        //     allowDisable : function(topBtn, menu){

        //         if(!this.getActiveConnectTab()){

        //             return true;
        //         }

        //         return false;
        //     }
        // },

        // {
        //     text : 'Alter Database',
        //     scope : this.application,
        //     handler : function(){

        //         var node = this.getSelectedNode();
        //         this.alterDatabase(node);
        //     },
        //     allowDisable : function(topBtn, menu){

        //         if(!this.getActiveConnectTab()){

        //             return true;
        //         }

        //         return false;
        //     }
        // },

        {
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
                text : 'Table',
                scope : this.application,
                handler : function(){

                    this.openCreateTableWindow();
                }
            },{
                text : 'View',
                scope : this.application,
                handler : function(){

                    this.createView();
                }
            },{
                text : 'Stored Procedure',
                scope : this.application,
                handler : function(){

                    this.createProcedure();
                }
            },{
                text : 'Function',
                scope : this.application,
                handler : function(){

                    this.createFunction();
                }
            },{
                text : 'Trigger',
                scope : this.application,
                handler : function(){

                    this.createTrigger();
                }
            },{
                text : 'Event',
                scope : this.application,
                handler : function(){

                    this.createEvent();
                }
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
                text : 'Drop Database',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.dropDatabase(node);
                }
            },{
                text : 'Truncate Database',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.truncateDatabase(node);
                }
            }

            // ,{
            //     text : 'Empty Database',
            //     scope : this.application,
            //     handler : function(){

            //         var node = this.getSelectedNode();
            //         this.emptyDatabase(node);
            //     }
            // }

            ]
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
            disabled : true
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