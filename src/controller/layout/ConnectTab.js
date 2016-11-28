Ext.define('Planche.controller.layout.ConnectTab', {
    extend: 'Ext.app.Controller',
    views : [
        'Planche.view.layout.SchemaTree',
        'Planche.view.layout.QueryTabPanel'
    ],
    init : function () {

        this.control({
            'connect-tab' : {
                boxready : function (tab) {

                    // main.setActiveTab(tab);
                    //this.initQueryTab('Query', false);
                    this.getApplication().checkToolbar();
                },
                activate : function (tab) {

                    this.getApplication().checkToolbar();
                },
                destroy : function (tab) {

                    this.getApplication().checkToolbar();
                }
            }
        });
    }
});
