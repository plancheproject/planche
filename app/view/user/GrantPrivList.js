Ext.define('Planche.view.user.GrantPrivList', {
    extend       : 'Ext.grid.Panel',
    alias        : 'widget.grant-priv-list',
    emptyText    : 'There\'s no data to display',
    initComponent: function() {

        var list = this;

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            mode         : 'multi',
            onHeaderClick: function(headerCt, header, e) {

                if (header.isCheckerHd) {

                    e.stopEvent();
                    var isChecked = header.el.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
                    if (isChecked) {

                        this.deselectAll(true);
                        //YOUR CODE ON UNCHECK
                        list.fireEvent('checkall');

                    } else {

                        this.selectAll(true);
                        //YOUR CODE ON CHECK
                        list.fireEvent('checkall');
                    }
                }
            }
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