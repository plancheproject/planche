Ext.define('Planche.lib.Menu', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        this.added = true;
    },

    init : function(topBtn){

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