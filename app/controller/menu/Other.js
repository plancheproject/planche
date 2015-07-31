Ext.define('Planche.controller.menu.Other', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        topBtn.menu.add([{
            text: '..'
        }]);

        this.added = true;
    }
});