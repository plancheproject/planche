Ext.define('Planche.view.table.TableSQLTab', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.table-sql-tab',
    title   : 'Table Properties',
    config : {
        edited: false,
        application : null,
        database : null,
        table : null
    },
    initComponent : function(){

        this.callParent(arguments);
    }
});