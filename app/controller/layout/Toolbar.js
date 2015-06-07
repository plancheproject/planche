Ext.define('Planche.controller.layout.Toolbar', {
    extend: 'Ext.app.Controller',
    views : [
        'Planche.view.layout.Toolbar'
    ],
    init : function () {

        var app = this.getApplication();

        this.control({
            '#toolbar-new-connect' : {
                click : Ext.Function.bind(app.openConnPanel, app)
            },
    
            '#toolbar-query-editor' : {
                click : Ext.Function.bind(app.openQueryTab, app)
            },

            '#toolbar-query-exec' : {
                click : Ext.Function.bind(app.executeQuery, app)
            },

            '#toolbar-stop-operation' : {
                click : Ext.Function.bind(app.stopOperation, app)
            },

            '#toolbar-user-manager' : {
                click : Ext.Function.bind(app.openUserPanel, app)
            },

            '#toolbar-tokenize' : {
                click : Ext.Function.bind(app.tokenize, app)
            },

           '#toolbar-quick-command' : {
                click : Ext.Function.bind(app.openQuickPanel, app)
            },

           '#toolbar-show-procs' : {
                click : Ext.Function.bind(app.openProcessPanel, app)
            },

            '#toolbar-show-vars' : {
                click : Ext.Function.bind(app.openVariablesPanel, app)
            },

            '#toolbar-show-status' : {
                click : Ext.Function.bind(app.openStatusPanel, app)
            },

            '#toolbar-flush' : {
                click : Ext.Function.bind(app.openFlushPanel, app)
            },

            'app-main toolbar splitbutton' : {
                click : this.showMenu,
                mouseover : this.showMenu
            }
        });
    },

    showMenu : function (btn) {

        Ext.applyIf(btn, { custom : false });

        if(btn.custom == true) { return; }

        var id = 'menu.'+btn.text;
        var ctrl = this.getController(id, btn);
        ctrl.show(btn);
    }
});

