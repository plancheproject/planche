Ext.define('Planche.view.table.TablePropertiesTab', {
    extend: 'Ext.panel.Panel',
    alias : 'widget.table-properties-tab',
    id    : 'table-properties-tab',
    title : 'Table Properties',
    height: '100%',
    border: false,
    config: {
        edited     : false,
        application: null,
        database   : null,
        table      : null,
        properties : {}
    },
    items : [{
        xtype  : 'form',
        id     : 'properties-form',
        layout : {
            type      : 'table',
            // The total column count must be specified here
            columns   : 2,
            tableAttrs: {
                style: {
                    width: '100%'
                }
            }
        },
        border : false,
        padding: 10,
        items  : [{
            xtype           : 'combobox',
            id              : 'properties-table-type',
            name            : 'properties-table-type',
            fieldLabel      : 'Table Type',
            displayField    : 'text',
            emptyText       : 'Default',
            disableKeyFilter: true,
            editable        : false,
            valueField      : 'id',
            validateBlank   : true,
            allowBlank      : true,
            typeAhead       : true,
            store           : [
                ['MYISAM', 'MYISAM'],
                ['MRG_MYISAM', 'MRG_MYISAM'],
                ['CSV', 'CSV'],
                ['BLACKHOLE', 'BLACKHOLE'],
                ['MEMORY', 'MEMORY'],
                ['FEDERATED', 'FEDERATED'],
                ['ARCHIVE', 'ARCHIVE'],
                ['INNODB', 'INNODB'],
                ['PERFORMANCE_SCHEMA', 'PERFORMANCE_SCHEMA']
            ]
        }, {
            xtype           : 'combobox',
            id              : 'properties-charset',
            name            : 'properties-charset',
            fieldLabel      : 'Charset',
            displayField    : 'text',
            emptyText       : 'Default',
            disableKeyFilter: true,
            editable        : false,
            valueField      : 'id',
            validateBlank   : true,
            allowBlank      : true,
            typeAhead       : true,
            store           : {
                type  : 'array',
                fields: ['id', 'text'],
                data  : [],
                proxy : {
                    type: 'memory'
                }
            }
        }, {
            xtype           : 'combobox',
            id              : 'properties-collation',
            name            : 'properties-collation',
            fieldLabel      : 'Collation',
            displayField    : 'text',
            emptyText       : 'Default',
            disableKeyFilter: true,
            editable        : false,
            valueField      : 'id',
            validateBlank   : true,
            allowBlank      : true,
            typeAhead       : true,
            store           : {
                type  : 'array',
                fields: ['id', 'text'],
                data  : [],
                proxy : {
                    type: 'memory'
                }
            }
        }, {
            xtype           : 'combobox',
            id              : 'properties-checksum',
            name            : 'properties-checksum',
            fieldLabel      : 'Check Sum',
            displayField    : 'text',
            emptyText       : 'Default',
            disableKeyFilter: true,
            editable        : false,
            valueField      : 'id',
            validateBlank   : true,
            allowBlank      : true,
            typeAhead       : true,
            store           : [
                [0, 0],
                [1, 1]
            ]
        }, {
            xtype           : 'combobox',
            id              : 'properties-delay-key-write',
            name            : 'properties-delay-key-write',
            fieldLabel      : 'Delay Key Write',
            displayField    : 'text',
            emptyText       : 'Default',
            disableKeyFilter: true,
            editable        : false,
            valueField      : 'id',
            validateBlank   : true,
            allowBlank      : true,
            typeAhead       : true,
            store           : [
                [0, 0],
                [1, 1]
            ]
        }, {
            xtype           : 'combobox',
            id              : 'properties-row-format',
            name            : 'properties-row-format',
            fieldLabel      : 'Row Format',
            displayField    : 'text',
            emptyText       : 'Default',
            disableKeyFilter: true,
            editable        : false,
            valueField      : 'id',
            validateBlank   : true,
            allowBlank      : true,
            typeAhead       : true,
            store           : [
                ['compressed', 'compressed'],
                ['dynamic', 'dynamic'],
                ['fixed', 'fixed']
            ]
        }, {
            xtype     : 'textfield',
            fieldLabel: 'Auto Incr.',
            id        : 'properties-auto-incr',
            name      : 'properties-auto-incr',
            allowBlank: true
        }, {
            xtype     : 'textfield',
            fieldLabel: 'Avg Row Len.',
            id        : 'properties-avg-row-len',
            name      : 'properties-avg-row-len',
            allowBlank: true
        }, {
            xtype     : 'textfield',
            fieldLabel: 'Minimum Row',
            id        : 'properties-minimum-row',
            name      : 'properties-minimum-row',
            allowBlank: true
        }, {
            xtype     : 'textfield',
            fieldLabel: 'Maximum Row',
            id        : 'properties-maximum-row',
            name      : 'properties-maximum-row',
            allowBlank: true
        }, {
            xtype     : 'textfield',
            fieldLabel: 'Comment',
            id        : 'properties-comment',
            name      : 'properties-comment',
            allowBlank: true
        }]
    }],

    initComponent: function() {

        var app = this.getApplication(),
            tb = this.getTable();

        this.tbar = {
            id        : 'properties-scheme-name',
            xtype     : 'textfield',
            width     : '100%',
            allowBlank: false,
            emptyText : 'Enter new table name..',
            disabled  : tb ? true : false,
            value     : tb
        };

        this.buttons = [{
            id  : 'table-properties-btn-create',
            text: tb ? 'Alter' : 'Create'
        }];

        this.callParent(arguments);
    }
});