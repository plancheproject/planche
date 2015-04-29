Ext.define('Planche.view.table.TableSQLTab', {
    extend  : 'Ext.container.Container',
    alias   : 'widget.table-sql-tab',
    title   : 'Table SQL',
    config : {
        edited: false,
        application : null,
        database : null,
        table : null
    },
    html        : '<textarea></textarea>',
    initComponent : function () {

        this.callParent(arguments);
    }
});