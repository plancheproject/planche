Ext.define('Planche.controller.menu.bookmark.Planche-Desktop', {
    extend: 'Planche.lib.Menu',
    alternateClassName: 'Planche.controller.menu.Bookmark',
    add   : function(topBtn) {

        var app = this.getApplication();

        topBtn.menu.add([{
            text   : 'Add SQL bookmark',
            handler : function(){

                alert('coming soon');
            }
        }, {
            text   : 'Load SQL bookmark',
            handler : function(){

                alert('coming soon');
            }
        }]);

        this.added = true;
    }
});
