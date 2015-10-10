Ext.define('Planche.view.table.ResultGrid', {
    extend       : 'Ext.grid.Panel',
    alias        : 'widget.result-grid',
    border       : true,
    flex         : 1,
    columnLines  : true,
    selModel     : {
        selType: 'checkboxmodel'
    },
    viewConfig   : {
        emptyText: 'There are no items to show in this view.'
    },
    autoScroll   : true,
    config       : {
        query      : null,
        response   : null,
        application: null,
        database   : null,
        table      : null
    },
    initComponent: function() {

        this.callParent(arguments);
    }
});