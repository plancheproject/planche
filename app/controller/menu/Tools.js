Ext.define('Planche.controller.menu.Tools', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'Show Process List',
            scope : this.application,
            handler : function(){

                this.openProcessPanel();
            },
            allowDisable : function(topBtn, menu){

                if(!this.getActiveMainTab()){

                    return true;
                }

                return false;
            }
        },{
            text : 'Show Variables',
            scope : this.application,
            handler : function(){

                this.openVariablesPanel();
            },
            allowDisable : function(topBtn, menu){

                if(!this.getActiveMainTab()){

                    return true;
                }

                return false;
            }
        },{
            text : 'Show Status',
            scope : this.application,
            handler : function(){

                this.openStatusPanel();
            },
            allowDisable : function(topBtn, menu){

                if(!this.getActiveMainTab()){

                    return true;
                }

                return false;
            }
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
