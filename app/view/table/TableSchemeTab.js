Ext.define('Planche.view.table.TableSchemeTab', {
    extend  : 'Ext.grid.Panel',
    alias   : 'widget.table-scheme-tab',
    id      : 'table-scheme-tab',
    border  : false,
    title   : 'Table Scheme',
    selModel: {
        selType: 'cellmodel'
    },
    config : {
        edited: false,
        application : null,
        database : null,
        table : null
    },
    columnLines: true,
    width : '100%',
    flex  : 1,
    initComponent : function(){

        var app = this.getApplication(),
            tb = this.getTable();

        this.addPlugin(Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2
        }));

        this.tbar = {
            id        : 'table-scheme-name',
            xtype     : 'textfield',
            width     : '100%',
            allowBlank: false,
            emptyText : 'Enter new table name..',
            disabled  : tb ? true : false,
            value     : tb
        }

        this.buttons = [{
            id  : 'table-scheme-btn-create',
            text: tb ? 'Alter' : 'Create'
        },{
            id  : 'table-scheme-btn-insert',
            text: 'Insert'
        },{
            id  : 'table-scheme-btn-delete',
            text: 'Delete'
        }];

        this.columns = [
            { text: 'Field Name', dataIndex: 'field', width : 120, editor: {
                xtype: 'textfield'
            }},
            { text: 'Datatype', dataIndex: 'type' ,  width : 120, editor: {
                xtype: 'combobox',
                store : app.getAPIS().getDataTypesToJSON()
            }},
            { text: 'Length', dataIndex: 'len', width : 60, editor: {
                xtype: 'textfield'
            }},
            { text: 'Default', dataIndex: 'default', width : 100, editor: {
                xtype: 'textfield'
            }},
            { text: 'PK', xtype: 'checkcolumn', dataIndex: 'pk', width : 60 },
            { text: 'Not Null', xtype: 'checkcolumn', dataIndex: 'not_null', width : 60 },
            { text: 'Unsigned', xtype: 'checkcolumn', dataIndex: 'unsigned', width : 60 },
            { text: 'Auto Incr', xtype: 'checkcolumn', dataIndex: 'auto_incr', width : 60 },
            { text: 'Zerofill', xtype: 'checkcolumn', dataIndex: 'zerofill', width : 60 },
            { text: 'Comment', dataIndex: 'comment', flex: 1, editor: {
                xtype: 'textfield'
            }}
        ];

        var fields  = [];

        //create grid fields
        Ext.each(this.columns, function(obj){

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