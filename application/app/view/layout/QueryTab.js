Ext.define('Planche.view.layout.QueryTab', {
    extend: 'Ext.container.Container',
    xtype : 'query-tab',
    layout: 'border',
    icon  : 'resources/images/icon_document_add.png',
    border: false,
    width : '100%',
    flex  : 1,
    items : [{
        xtype : 'query-editor'
    },{
        xtype : 'result-tab-panel'
    }]
});