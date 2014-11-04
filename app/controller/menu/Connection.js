Ext.define('Planche.controller.menu.Connection', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'New Connection Using Current Setting',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                if(!this.getActiveMainTab()){

                    return true;
                }

                return false;
            }
        },{
            text : 'New Connection',
            scope : this.application,
            handler : function(){

                this.openConnPanel();
            }
        },{
            text : 'New Query Editor',
            scope : this.application,
            handler : function(){

                this.openQueryTab();
            },
            allowDisable : function(topBtn, menu){

                if(!this.getActiveMainTab()){

                    return true;
                }

                return false;
            }
        },{
            text : 'Close Tab',
            scope : this.application,
            handler : function(){

                var actSubTab = this.getActiveSubTab();
                actSubTab.destroy();
            },
            allowDisable : function(topBtn, menu){

                if(!this.getActiveSubTab()){

                    return true;
                }

                return false;
            }
        },{
            text : 'Close Other Tabs',
            scope : this.application,
            handler : function(){

                var tabPanel = this.getSubTab().query('tabpanel');
                var actSubTab = this.getActiveSubTab();

                Ext.Array.each(tabPanel, function(tab, idx){

                    if(actSubTab != tab.up()){

                        tab.up().destroy();
                    }
                    else {

                        tab.addClass('x-tab-strip-closable');
                        debugger;
                    }
                });
            },
            allowDisable : function(topBtn, menu){

                if(!this.getActiveSubTab()){

                    return true;
                }

                var tabPanel = this.getSubTab().query('tabpanel');

                if(tabPanel.length < 2){

                    return true;
                }

                return false;
            }
        },{
            text : 'Disconnect',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                if(!this.getActiveMainTab()){

                    return true;
                }

                return false;
            },
            handler : function(){

                this.closeActiveConnectionTab();
            }
        },{
            text : 'Disconnect All',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                if(!this.getActiveMainTab()){

                    return true;
                }

                return false;
            },
            handler : function(){

                var connections = this.getMainTab().query('>>tab');
                Ext.Array.each(connections, function(tab, idx){

                    tab.destroy();
                });
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