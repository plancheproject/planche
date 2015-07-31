Ext.define('Planche.controller.database.SchemaToHTML', {
    extend: 'Ext.app.Controller',
    views : [
        'database.SchemaToHTML'
    ],
    init  : function() {

        var app = this.getApplication();

        this.control({
            '#schema-to-html-window': {
                boxready: function(win){

                    win.maximize();
                }
            },
            '#schema-to-html': {
                boxready: function(panel){

                    Planche.SchemaUtil.exportAllSchemaToHTML(panel, 'update');
                }
            },
            '#schema-to-html-btn-close' : {
                click : this.close
            }
        });

        this.callParent(arguments);
    },

    initWindow: function() {

        var app = this.getApplication();

        Ext.create('Planche.view.database.SchemaToHTML', {
            database   : app.getSelectedDatabase(),
            application: app
        });
    },

    close : function(btn){

        btn.up('window').destroy();
    }
});