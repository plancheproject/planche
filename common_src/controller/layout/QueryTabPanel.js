Ext.define('Planche.controller.layout.QueryTabPanel', {
    extend: 'Ext.app.Controller',
    controllers : [
        'layout.QueryTab'
    ],
    views : [
        'layout.QueryTab'
    ],
    init : function () {

        this.control({
            'query-tab-panel' : {
                'initQueryTab' : this.initQueryTab
            }
        });
    },

    initQueryTab : function (name, closable) {

        var
        app      = this.getApplication(),
        tabPanel = app.getQueryTabPanel(),
        closable = closable !== false,
        tab      = Ext.create('Planche.view.layout.QueryTab', {
            title    : name,
            closable : closable
        });

        if(!tabPanel) { return; }

        tabPanel.add(tab);
        tabPanel.setActiveTab(tab);
    }
});
