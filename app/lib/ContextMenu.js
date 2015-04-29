Ext.define('Planche.lib.ContextMenu', {
    extend : 'Ext.menu.Menu',
    margin: '0 0 10 0',
    initComponent : function () {

        this.callParent(arguments);
    },
    defaults : {
        scope : this
    },
    items: [{
        id : 'btn-context-each-tb-paste-sql-statement',
        text: 'Paste SQL Statement',
        defaults : {
            scope : this
        },
        listeners : {
            scope : this,
            activate : function (menu) {

                var subTab = this.getActiveSubTab();
                Ext.Object.each(menu.menu.items.items, function (idx, obj) { 
                    obj[subTab ? 'enable' : 'disable'](); 
                });
            }
        },
        menu : [{
            text: 'INSERT INTO &lt;Table Name&gt;..',
            scope : this,
            handler : function () {

                var n = this.getSelectedNode();
                this.fireEvent('paste-sql-statement-insert', n);
            }
        },{
            text: 'UPDATE &lt;Table Name&gt; SET..',
            scope : this,
            handler : function () {

                var n = this.getSelectedNode();
                this.fireEvent('paste-sql-statement-update', n);
            }
        },{
            text: 'DELETE FROM &lt;Table Name&gt;..',
            scope : this,
            handler : function () {

                var n = this.getSelectedNode();
                this.fireEvent('paste-sql-statement-delete', n);
            }
        },{
            text: 'SELECT &lt;col-1&gt;..&lt;col-n&gt; FROM &lt;Table Name&gt;',
            scope : this,
            handler : function () {

                var n = this.getSelectedNode();
                this.fireEvent('paste-sql-statement-select', n);
            }
        }]
    },{
        id : 'btn-context-each-tb-copy',
        text: 'Copy Table(s) To Differnt Host/Database',
        handler : function () {

        }
    },{
        xtype: 'menuseparator'
    },{
        id : 'btn-context-each-tb-open',
        text: 'Open Table',
        handler : function () {

            this.openTable(this.getSelectedNode());
        }
    },{
        id : 'btn-context-each-tb-create',
        text: 'Create Table',
        handler : function () {

        }
    },{
        id : 'btn-context-each-tb-alter',
        text: 'Alter Table',
        scope : this,
        handler : function () {

            this.openTableWindow();
        }
    },{
        id : 'btn-context-each-tb-more-operation',
        text: 'More Table Operations',
        menu : [{
            text: 'Rename Table',
            handler : function () {

            }
        },{
            text: 'Truncate Table',
            handler : function () {

            }
        },{
            text: 'Drop Table From Database',
            handler : function () {

            }
        },{
            text: 'Reorder Column(s)',
            handler : function () {

            }
        },{
            text: 'Duplicate Table Structure/Data',
            handler : function () {

            }
        },{
            text: 'View Advanced Properties',
            handler : function () {

            }
        },{
            text: 'Change Table To Type',
            handler : function () {

            }
        }]
    },{
        xtype: 'menuseparator'
    },{
        id : 'btn-context-each-tb-create-trigger',
        text: 'Create Trigger',
        handler : function () {

        }
    }]
});