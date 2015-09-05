Ext.define('Planche.controller.menu.Help', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        var app = this.getApplication();

        topBtn.menu.add([{
            text   : 'About Planche',
            handler : function(){

                app.openWindow('help.AboutPlanche');
            }
        }]);

        this.added = true;
    }
});