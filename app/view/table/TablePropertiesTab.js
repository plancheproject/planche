Ext.define('Planche.view.table.TablePropertiesTab', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.table-properties-tab',
    title   : 'Table Properties',
    config : {
        edited: false,
        application : null,
        database : null,
        table : null
    },
    items : [
    	
    ],
    initComponent : function () {

        this.callParent(arguments);
    }
});