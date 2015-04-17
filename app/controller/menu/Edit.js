Ext.define('Planche.controller.menu.Edit', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function (topBtn) {

        topBtn.menu.add([{
            text : 'Refresh Object Browser',
            scope : this.application,
            allowDisable : function (topBtn, menu) {

                if(!this.getActiveConnectTab()) {

                    return true;
                }

                return false;
            }
        },{
            text : 'Excute Query',
            scope : this.application,
            handler : function () {

                this.executeQuery();
            },
            allowDisable : function (topBtn, menu) {

                if(!this.getActiveEditor()) {

                    return true;
                }

                return false;
            }
        },
        '-'
        ,{
            text : 'SQL Formatter',
            scope : this.application,
            handler : function () {

                this.formatQuery();
            },
            allowDisable : function (topBtn, menu) {

                if(!this.getActiveEditor()) {

                    return true;
                }

                return false;
            }
        },
        '-'
        ,{
            text : 'Undo',
            scope : this.application,
            handler : function () {

                this.getActiveEditor().undo(); 
            },
            allowDisable : function () {

                if(!this.getActiveEditor()) {

                    return true;
                }

                if(this.getActiveEditor().historySize().undo < 1) {

                    return true;
                }

                return false;
            }
        },{
            text : 'Redo',
            scope : this.application,
            handler : function () {

                this.getActiveEditor().redo();                
            },
            allowDisable : function () {

                if(!this.getActiveEditor()) {

                    return true;
                }

                if(this.getActiveEditor().historySize().redo < 1) {

                    return true;
                }

                return false;
            }
        }
        // '-'
        // ,{
        //     text : 'Cut',
        //     scope : this.application,
        //     handler : function () {

        //         this.getActiveEditor().cut();                
        //     },
        //     allowDisable : function () {

        //         if(!this.getActiveEditor()) {

        //             return true;
        //         }

        //         if(!this.getActiveEditor().somethingSelected()) {

        //             return true;
        //         }

        //         return false;
        //     }
        // },{
        //     text : 'Copy',
        //     scope : this.application,
        //     handler : function () {

        //         this.getActiveEditor().copy();                
        //     },
        //     allowDisable : function () {

        //         if(!this.getActiveEditor()) {

        //             return true;
        //         }

        //         if(!this.getActiveEditor().somethingSelected()) {

        //             return true;
        //         }

        //         return false;
        //     }
        // },{
        //     text : 'Paste',
        //     scope : this.application,
        //     handler : function () {

        //         this.getActiveEditor().paste();                
        //     },
        //     allowDisable : function () {

        //         if(!this.getActiveEditor()) {

        //             return true;
        //         }

        //         return false;
        //     }
        // },
        // '-'
        // ,{
        //     text : 'Find',
        //     scope : this.application,
        //     handler : function () {

        //         this.openFindPanel()                
        //     },
        //     allowDisable : function () {

        //         if(!this.getActiveEditor()) {

        //             return true;
        //         }

        //         return false;
        //     }
        // },{
        //     text : 'Find Next',
        //     scope : this.application,
        //     handler : function () {

        //         this.openWindow('command.Find');                
        //     },
        //     allowDisable : function () {

        //         if(!this.getActiveEditor()) {

        //             return true;
        //         }

        //         return false;
        //     }
        // },{
        //     text : 'Replace',
        //     scope : this.application,
        //     handler : function () {

        //         this.openWindow('command.Replace');               
        //     },
        //     allowDisable : function () {

        //         if(!this.getActiveEditor()) {

        //             return true;
        //         }

        //         return false;
        //     }
        ]);

        this.added = true;
    },

    show : function (topBtn) {

        if(!this.added) {

            this.add(topBtn);
        }

        Ext.Array.each(topBtn.menu.query('menuitem'), function (menu, idx) {
            
            switch(typeof menu.allowDisable) {

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