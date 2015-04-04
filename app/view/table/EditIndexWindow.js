Ext.define('Planche.view.table.EditIndexWindow', {
    extend    : 'Planche.lib.Window',
    id        : 'edit-index-window',
    stateful  : true,
    layout    : 'fit',
    bodyStyle :"background-color:#FFFFFF",
    width     : 1000,
    height    : 500,
    overflowY : 'auto',
    autoScroll: true,
    border    : false,
    modal     : true,
    plain     : true,
    fixed     : true,
    shadow    : false,
    autoShow  : true,
    constrain : true,
    config    : {
        database : null,
        table : null,
        indexName : null
    },
    items     : [{
        xtype : 'grid',
        border : false,
        selModel : {
            selType : 'cellmodel'
        },
        plugins : [{
            ptype : 'cellediting',
            clickToEdit : 2
        }],
        viewConfig: { 
            emptyText : 'There are no columns to show in this view.' 
        },
        id : 'edit-index-grid',
        columns : [            
            { text: 'Field Name', dataIndex: 'field', width : 120},
            { text: 'Datatype', dataIndex: 'type' ,  width : 120},
            { text: 'Comment', dataIndex: 'comment', flex: 1},
            { text: 'Use Column', xtype : 'checkcolumn', width : 100, dataIndex: 'use'},
            { text: 'Length', width : 100, dataIndex: 'length', editor : {
                xtype : 'textfield'
            }},
            { text: 'Sort', dataIndex: 'sort', width : 100, editor : {
                xtype : 'combobox',
                store : ['ASC', 'DESC']
            }}
        ],
        store : Ext.create('Ext.data.Store', {
            fields            : [
                'field',    'type',     'comment',      'use',
                'length',   'sort'
            ],
            clearRemovedOnLoad: false
        }),
        tbar : {
            id        : 'edit-index-name',
            xtype     : 'textfield',
            width     : '100%',
            allowBlank: false,
            emptyText : 'Enter new table name'
        },
        fbar : [{
            xtype : 'displayfield',
            fieldLabel : 'Index Options'
        },{
            xtype : 'checkbox',
            boxLabel : 'No Option'
        },{
            xtype : 'checkbox',
            boxLabel : 'Unique'
        },{
            xtype : 'checkbox',
            boxLabel : 'Fulltext'
        },{
            xtype : 'checkbox',
            boxLabel : 'Spatial'
        },,{
            xtype : 'checkbox',
            boxLabel : 'Primary key'
        }]
    }],
    buttons   : [{
        id     : 'edit-index-btn-save',
        text   : 'Save'
    },{
        id     : 'edit-index-btn-close',
        text   : 'Close'
    }]
});