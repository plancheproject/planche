Ext.define('Planche.view.user.GrantPrivList', {
    extend       : 'Ext.grid.Panel',
    alias        : 'widget.grant-priv-list',
    emptyText    : 'There\'s no data to display',
    initComponent: function() {

        var list = this;

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            mode         : 'multi'
        });

        this.columns = [
            {text: 'Privileges', dataIndex: 'cmd', flex: 1, sortable: false, menuDisabled: true}
        ];

        this.store = Ext.create('Ext.data.Store', {
            fields: ['priv', 'cmd'],
            data  : []
        });

        this.callParent(arguments);

    }
});