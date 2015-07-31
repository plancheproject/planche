Ext.define('Planche.controller.menu.Window', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        topBtn.menu.add([{
            text   : 'New Connection Using Current Setting',
            disable: function() {

                return false;
            }
        }, {
            text: 'New Connection'
        }, {
            text: 'New Query Editor'
        }, {
            text: 'Close Tab'
        }, {
            text: 'Close Other Tabs'
        }, {
            text: 'Disconnect'
        }, {
            text: 'Disconnect All'
        }]);

        this.added = true;
    }
});