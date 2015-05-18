Ext.define('Planche.view.user.GrantPrivList', {
    extend       : 'Ext.grid.Panel',
    alias        : 'widget.grant-priv-list',
    emptyText    : 'There\'s no data to display',
    initComponent: function() {

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            mode: 'multi'
        });

        this.columns = [
            {text: 'Privileges', dataIndex: 'priv', flex: 1, sortable: false, menuDisabled: true}
        ];

        this.store = Ext.create('Ext.data.Store', {
            fields: ['selected', 'priv'],
            data  : []
        });

        this.callParent(arguments);

    }
});