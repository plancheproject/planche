Ext.define('Planche.controller.menu.Connection', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        topBtn.menu.add([{
            text        : 'New Connection Using Current Setting',
            scope       : this.application,
            allowDisable: function(topBtn, menu) {

                if (!this.getActiveConnectTab()) {

                    return true;
                }

                return false;
            },
            handler     : function() {

                var tab = this.getActiveConnectTab();
                this.initConnectTab({
                    hostName    : tab.getHostName(),
                    tunnelingURL: tab.getTunnelingURL(),
                    requestType : tab.getRequestType(),
                    host        : tab.getHost(),
                    user        : tab.getUser(),
                    pass        : tab.getPass(),
                    charset     : tab.getCharset(),
                    port        : tab.getPort(),
                    dbms        : tab.getDBMS()
                });
            }
        }, {
            text   : 'New Connection',
            scope  : this.application,
            handler: function() {

                this.openConnPanel();
            }
        }, {
            text        : 'New Query Editor',
            scope       : this.application,
            handler     : function() {

                this.openQueryTab();
            },
            allowDisable: function(topBtn, menu) {

                if (!this.getActiveConnectTab()) {

                    return true;
                }

                return false;
            }
        }, {
            text        : 'Close Query Tab',
            scope       : this.application,
            handler     : function() {

                var actSubTab = this.getActiveQueryTab();
                actSubTab.destroy();
            },
            allowDisable: function(topBtn, menu) {

                if (!this.getActiveQueryTab()) {

                    return true;
                }

                return false;
            }
        }, {
            text        : 'Close Other Query Tabs',
            scope       : this.application,
            handler     : function() {

                var tabPanel = this.getQueryTabPanel().query('tabpanel');
                var actSubTab = this.getActiveQueryTab();

                Ext.Array.each(tabPanel, function(tab, idx) {

                    if (actSubTab != tab.up()) {

                        tab.up().destroy();
                    }
                    else {

                        tab.addClass('x-tab-strip-closable');
                    }
                });
            },
            allowDisable: function(topBtn, menu) {

                if (!this.getActiveQueryTab()) {

                    return true;
                }

                var tabPanel = this.getQueryTabPanel().query('tabpanel');

                if (tabPanel.length < 2) {

                    return true;
                }

                return false;
            }
        }, {
            text        : 'Disconnect',
            scope       : this.application,
            allowDisable: function(topBtn, menu) {

                if (!this.getActiveConnectTab()) {

                    return true;
                }

                return false;
            },
            handler     : function() {

                this.closeActiveConnectionTab();
            }
        }, {
            text        : 'Disconnect All',
            scope       : this.application,
            allowDisable: function(topBtn, menu) {

                if (!this.getActiveConnectTab()) {

                    return true;
                }

                return false;
            },
            handler     : function() {

                var app = this,
                    conns = app.getConnectTabPanel().query('>>tab');
                Ext.Array.each(conns, function(tab, idx) {

                    app.closeActiveConnectionTab();
                });
            }
        }]);

        this.added = true;
    }
});