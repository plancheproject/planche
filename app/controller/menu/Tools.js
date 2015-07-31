Ext.define('Planche.controller.menu.Tools', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        topBtn.menu.add([{
            text        : 'Show Process List',
            scope       : this.application,
            handler     : function() {

                this.openProcessPanel();
            },
            allowDisable: function(topBtn, menu) {

                if (!this.getActiveConnectTab()) {

                    return true;
                }

                return false;
            }
        }, {
            text        : 'Show Variables',
            scope       : this.application,
            handler     : function() {

                this.openVariablesPanel();
            },
            allowDisable: function(topBtn, menu) {

                if (!this.getActiveConnectTab()) {

                    return true;
                }

                return false;
            }
        }, {
            text        : 'Show Status',
            scope       : this.application,
            handler     : function() {

                this.openStatusPanel();
            },
            allowDisable: function(topBtn, menu) {

                if (!this.getActiveConnectTab()) {

                    return true;
                }

                return false;
            }
        }]);

        this.added = true;
    }
});
