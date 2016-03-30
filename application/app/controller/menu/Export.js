Ext.define('Planche.controller.menu.Export', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        var app = this.getApplication();

        topBtn.menu.add([{
            text        : 'Export Database Schema To HTML',
            allowDisable: function() {

                if (app.getSelectedDatabase()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                app.openSchemaToHTMLWindow();
            }
        }, '-', {
            text        : 'Download To CSV',
            allowDisable: function() {

                if (app.getSelectedDatabase()) {

                    return false;
                }

                return true;
            },
            handler     : function() {

                app.openSchemaToCSVWindow();
            }
        }, '-', {
            text    : 'Backup Database As SQL Dump(Not Yet)',
            disabled: true,
            menu    : [{
                text: ''
            }]
        }, {
            text    : 'Import(Not Yet)',
            disabled: true,
            menu    : [{
                text: 'Import External Data'
            }, {
                text: 'Execute SQL Script'
            }]
        }]);

        this.added = true;
    }
});