Ext.define('Planche.view.table.TableIndexesTab', {
    extend: 'Ext.grid.Panel',
    alias : 'widget.table-indexes-tab',
    id    : 'table-indexes-tab',
    title : 'Table Indexes',
    config: {
        edited: false,
        application : null,
        database : null,
        table : null
    },
    selModel : {
        singleSelect:true
    },
    initComponent : function () {

        var app = this.getApplication(),
            tb = this.getTable();

        this.buttons = [{
            id  : 'table-indexes-btn-create',
            text: 'Create Index'
        },{
            id  : 'table-indexes-btn-edit',
            text: 'Edit Index'
        },{
            id  : 'table-indexes-btn-delete',
            text: 'Delete Index'
        }];

        this.columns = [
            { text: 'Index Name', dataIndex: 'Key_name', width : 120},
            { text: 'Columns', dataIndex: 'Column_name', width : 120},
            { text: 'Index Type', dataIndex: 'Index_type', width : 120},
            { text: 'Comment', dataIndex: 'Index_comment', flex : 1}
        ];

        var fields  = [];

        //create grid fields
        Ext.each(this.columns, function (obj) {

            fields.push(obj.dataIndex);
        });

        //create store
        this.store = Ext.create('Ext.data.Store', {
            fields            : fields,
            clearRemovedOnLoad: false
        });

        this.callParent(arguments);
    }
});