Ext.define('Planche.view.database.CopyDatabaseTargetList', {
    extend       : 'Ext.grid.Panel',
    alias        : 'widget.copy-database-target-list',
    config       : {
        application: null
    },
    initComponent: function() {

        var app = this.getApplication();

        this.columns = [{
            text     : 'Connection',
            dataIndex: 'connection'
        }, {
            text     : 'Database',
            dataIndex: 'database',
            flex     : 1,
            renderer : function(value, p, record) {

                return Ext.String.format('<img src=\'resources/images/icon_database.png\'> {0}', record.raw.database);
            }
        }];

        this.store = Ext.create('Ext.data.Store', {
            fields: ['connection', 'database'],
            data  : []
        });

        this.callParent(arguments);
    }
});