Ext.define('Planche.view.layout.HistoryTab', {
	extend		: 'Ext.Component',
	xtype		: 'history-tab',
	icon		: 'resources/images/icon_history.png',
	title		: 'History',
	split		: true,
	border		: false,
	autoScroll	: true,
	flex		: 1,
	html		: '<textarea></textarea>'
});
