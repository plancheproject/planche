Ext.define('Planche.view.layout.ResultTabPanel', {
    extend  : 'Ext.tab.Panel',
    xtype   : 'result-tab-panel',
	layout  : 'fit',
	region	: 'south',
	split	: true,
	border	: true,
	width	: '100%',
	height	: 300,
    items : [{
    	xtype : 'message-tab'
    },{
    	xtype : 'table-data-tab'
    },{
    	xtype : 'info-tab'
    },{
    	xtype : 'history-tab'
    }]
});