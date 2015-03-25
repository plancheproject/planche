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


        // var closable = closable !== false;
        // var tab = Ext.create('Ext.container.Container', {
        //     layout      : 'border',
        //     icon        : 'images/icon_document_add.png',
        //     title       : name,
        //     border      : false,
        //     closable    : closable, 
        //     width       : '100%',
        //     flex        : 1,
        //     items : [
        //         this.initQueryEditor(),
        //         this.initResultTabPanel(),
        //     ]
        // });
        // var subTabPanel = this.getSubTab();
        // if(!subTabPanel){ return; }
        // subTabPanel.add(tab);
        // subTabPanel.setActiveTab(tab);