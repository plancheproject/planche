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