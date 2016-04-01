Ext.define('Planche.view.database.DownloadToCSVTargetList', {
    extend       : 'Ext.grid.Panel',
    alias        : 'widget.download-to-csv-target-list',
    config       : {
        application: null
    },
    initComponent: function() {

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            mode: 'multi'
        });

        this.columns = [
            Ext.create('Ext.grid.RowNumberer'),
            {
                text     : 'Table',
                dataIndex: 'Name',
                flex     : 1,
                renderer : function(value, p, record) {

                    return Ext.String.format('<img src=\'resources/images/icon_table.png\'> {0}', record.raw.Name);
                }
            }, {
                text     : 'Comment',
                dataIndex: 'Comment',
                width    : 200
            }];

        this.store = Ext.create('Ext.data.Store', {
            fields: ['Name', 'Comment'],
            data  : []
        });

        this.callParent(arguments);
    }
});