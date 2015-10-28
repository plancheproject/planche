Ext.define('Planche.controller.menu.Query', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        topBtn.menu.add([{
            text        : 'Excute Query',
            scope       : this.application,
            handler     : function() {

                this.executeQuery();
            },
            allowDisable: function(topBtn, menu) {

                if (!this.getActiveEditor()) {

                    return true;
                }

                return false;
            }
        }, '-', {
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

                if (this.getQueryTabPanel().child().length < 2) {

                    return true;
                }

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
        }]);

        this.added = true;
    }
});