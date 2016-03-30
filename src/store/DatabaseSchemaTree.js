Ext.define('Planche.store.DatabaseSchemaTree', {
    extend       : 'Ext.data.TreeStore',
    root         : {
        type    : 'database',
        text    : '',
        icon    : 'resources/images/icon_database.png',
        leaf    : false,
        expanded: true,
        children: [{
            type: 'tables',
            text: 'Tables',
            leaf: false
        }, {
            type: 'views',
            text: 'Views',
            leaf: false
        }, {
            type: 'procedures',
            text: 'Procedures',
            leaf: false
        }, {
            type: 'functions',
            text: 'Functions',
            leaf: false
        }, {
            type: 'triggers',
            text: 'Triggers',
            leaf: false
        }, {
            type: 'events',
            text: 'Events',
            leaf: false
        }]
    },
    initComponent: function() {

        this.callParent(arguments);
    }
});