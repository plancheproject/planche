Ext.define('Planche.view.layout.QueryTabPanel', {
    extend  : 'Ext.tab.Panel',
    alias   : 'widget.query-tab-panel',
    flex    : 1,
    region  : 'center',
    width   : '100%',
    height  : '100%',
    border  : false,
    items : [{
    	xtype : 'query-tab',
    	title : 'Query'
    }]
});