Ext.define('Planche.view.database.SchemaToHTML', {
    extend       : 'Planche.lib.Window',
    id           : 'schema-to-html-window',
    title        : 'Schema to HTML',
    stateful     : true,
    bodyStyle    : "background-color:#FFFFFF",
    width        : 1000,
    height       : 500,
    border       : false,
    modal        : true,
    plain        : true,
    fixed        : true,
    shadow       : false,
    autoShow     : true,
    constrain    : true,
    config       : {
        database   : null,
        application: null
    },
    initComponent: function() {

        var app = this.getApplication();

        this.items = [{
            xtype     : 'panel',
            id        : 'schema-to-html',
            layout    : 'fit',
            padding   : '10 10 10 10',
            autoScroll: true,
            border    : false
        }];

        this.callParent(arguments);
    },
    buttons      : [{
        id  : 'schema-to-html-btn-close',
        text: 'Close'
    }]
});