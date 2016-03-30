Ext.define('Planche.view.user.GrantUserList', {
    extend       : 'Ext.grid.Panel',
    alias        : 'widget.grant-user-list',
    config       : {
        application: null
    },
    initComponent: function() {

        var app = this.getApplication();

        this.columns = [{
            text        : 'User',
            dataIndex   : 'User',
            flex        : 1,
            sortable    : false,
            menuDisabled: true,
            renderer    : function(value, p, record) {

                return Ext.String.format('<img src=\'resources/images/icon_user.png\'> {0}', value + '@' + record.raw.Host);
            }
        }, {
            text : 'Edit', xtype: 'actioncolumn', width: 50, sortable: false, menuDisabled: true, align: 'center',
            items: [{
                icon   : 'resources/images/icon_edit.png',
                tooltip: 'Edit User'
            }]
        }, {
            text : 'Delete', xtype: 'actioncolumn', width: 50, sortable: false, menuDisabled: true, align: 'center',
            items: [{
                icon   : 'resources/images/icon_delete.gif',
                tooltip: 'Delete User'
            }]
        }];

        this.store = Ext.create('Ext.data.Store', {
            fields: ['User', 'Host'],
            data  : []
        });

        this.callParent(arguments);
    }
});