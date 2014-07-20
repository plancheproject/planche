Ext.define('Planche.controller.menu.Favorites', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'Add to Favorites',
            hidden : function(){

                return false;
            }()
        },{
            text : 'Organize Favorites'
        },{
            text : 'Refresh Favorites'
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