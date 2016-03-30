Ext.define('Planche.view.database.CopyDatabaseWindow', {
    extend       : 'Planche.lib.Window',
    id           : 'copy-database-window',
    title        : 'Copy table(s) to other database',
    stateful     : true,
    bodyStyle    : "background-color:#FFFFFF",
    width        : 1000,
    height       : 500,
    overflowY    : 'auto',
    autoScroll   : true,
    border       : false,
    modal        : true,
    plain        : true,
    fixed        : true,
    shadow       : false,
    autoShow     : true,
    constrain    : true,
    config       : {
        database   : null,
        application: null
    },
    initComponent: function() {

        var app = this.getApplication();

        this.items = [{
            xtype : 'panel',
            layout: 'border',
            items : [{
                xtype   : 'database-schema-tree',
                title   : 'Source',
                region  : 'west',
                width   : 300,
                split   : true,
                id      : 'copy-database-source-tree',
                database: this.getDatabase()
            }, {
                xtype : 'copy-database-target-list',
                title : 'Target',
                region: 'center',
                id    : 'copy-database-target-grid'
            }, {
                xtype : 'form',
                title : 'Option',
                layout: 'vbox',
                region: 'east',
                width : 300,
                split : true,
                id    : 'copy-database-option-form',
                items : [{
                    xtype   : 'radiogroup',
                    margin  : '5 0 0 5',
                    id      : 'copy-database-option-1',
                    layout  : 'vbox',
                    defaults: {
                        xtype: 'radiofield'
                    },
                    items   : [{
                        boxLabel  : 'Structure & Data',
                        name      : 'copy-database-option-1',
                        inputValue: 1,
                        checked   : true
                    }, {
                        boxLabel  : 'Structure Only',
                        name      : 'copy-database-option-1',
                        inputValue: 2
                    }]
                }, {
                    xtype   : 'checkbox',
                    margin  : '0 0 0 8',
                    id      : 'copy-database-option-2',
                    name    : 'copy-database-option-2',
                    boxLabel: 'Drop if exists in target',
                    value   : 1,
                    checked : true
                }, {
                    xtype   : 'checkbox',
                    margin  : '0 0 0 8',
                    id      : 'copy-database-option-3',
                    name    : 'copy-database-option-3',
                    boxLabel: 'Use bulk INSERT(Only Post Method Ajax)',
                    value   : 1,
                    checked : true
                }]
            }]
        }];

        this.callParent(arguments);
    },
    buttons      : [{
        id  : 'copy-database-btn-copy',
        text: 'Copy'
    }, {
        id  : 'copy-database-btn-close',
        text: 'Close'
    }]
});