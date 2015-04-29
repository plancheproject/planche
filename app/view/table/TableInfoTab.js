Ext.define('Planche.view.table.TableInfoTab', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.table-info-tab',
    title   : 'Table Information',
    padding : '10 10 10 10',
    autoScroll: true,
    config : {
        edited: false,
        application : null,
        database : null,
        table : null
    },
    initComponent : function () {

        this.callParent(arguments);
    }
});