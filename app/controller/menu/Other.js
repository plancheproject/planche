Ext.define('Planche.controller.menu.Other', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function (topBtn) {

        topBtn.menu.add([{
            text : '..'
        }]);

        this.added = true;
    },

    show : function (topBtn) {

        if(!this.added) {

            this.add(topBtn);
        }

        topBtn.menu.showBy(topBtn);
    }
});