Ext.define('Planche.controller.menu.Favorites', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        topBtn.menu.add([{
            text  : 'Add to Favorites',
            hidden: function() {

                return false;
            }()
        }, {
            text: 'Organize Favorites'
        }, {
            text: 'Refresh Favorites'
        }]);

        this.added = true;
    }
});