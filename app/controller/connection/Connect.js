Ext.define('Planche.controller.connection.Connect', {
    extend: 'Ext.app.Controller',

    initWindow: function() {

        var app = this.getApplication(),
            columns = this.makeListColumns(),
            fields = [];

        Ext.each(columns, function(obj) {

            fields.push(obj.dataIndex);
        });

        var store = Ext.create('Ext.data.Store', {
            fields: fields
        });


        var grid = Ext.create('Ext.grid.Panel', {
            id         : 'connect-grid',
            border     : false,
            columnLines: true,
            width      : '100%',
            flex       : 1,
            columns    : columns,
            store      : store,
            listeners  : {
                scope      : this,
                itemdblclick: this.connect,
                cellkeydown: function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                    if(e.keyCode === Ext.EventObject.ENTER){

                        this.connect();
                    }
                }
            }
        });

        store.on('refresh', function(store, records, successful, eOpts) {

            this.getSelectionModel().select(store.getAt(0));
            //debugger;
        }, grid);

        Ext.create('Planche.lib.Window', {
            id        : 'connect-window',
            stateful  : true,
            title     : 'Connect to MySQL Host',
            layout    : 'fit',
            bodyStyle : "background-color:#FFFFFF",
            width     : 900,
            height    : 500,
            overflowY : 'auto',
            autoScroll: true,
            modal     : true,
            plain     : true,
            fixed     : true,
            shadow    : false,
            autoShow  : true,
            constrain : true,
            items     : grid,
            buttons   : [{
                text   : 'Connect',
                scope  : this,
                handler: this.connect
            }, {
                text   : 'Test Connect',
                scope  : this,
                handler: this.testConnect
            }],
            listeners : {
                boxready: function() {

                    store.loadData(Planche.config.hosts);
                }
            }
        });
    },

    connect: function() {

        var me = this,
            app = me.getApplication();

        this.ping(function() {

            var win = me.getConnectWindow(),
                conn = me.getSelectedConnection();

            app.initConnectTab(conn.raw);

            win.destroy();
        });
    },

    testConnect: function() {

        var me = this;

        this.ping(function() {

            var win = me.getConnectWindow();
            win.setDisabled(false);

            Ext.Msg.alert('Info', 'Connection is successful');
        });
    },

    ping: function(callback) {

        var win = this.getConnectWindow(),
            app = this.getApplication(),
            conn = this.getSelectedConnection();

        win.setDisabled(true);

        app.tunneling(Ext.apply({
            query  : 'SELECT 1',
            timeout: 5000,
            success: function(config, response) {

                callback();
            },
            failure: function(config, response) {

                win.setDisabled(false);
                Ext.Msg.alert('Error', response.message);
            }
        }, conn.raw));
    },

    getConnectWindow: function() {

        return Ext.getCmp('connect-window');
    },

    getSelectedConnection: function() {

        var grid = Ext.getCmp('connect-grid'),
            selGrid = grid.selModel.getSelection();

        if (selGrid.length == 0) {

            return false;
        }

        return selGrid[0];
    },

    makeListColumns: function() {

        return [
            {
                text: 'Host Name', dataIndex: 'hostName', width: 200, renderer: function(value, p, record) {

                return Ext.String.format('<img src=\'resources/images/icon_database24x24.png\'> {0}', value);
            }
            },
            {
                text: 'Host', dataIndex: 'host', width: 100, renderer: function(value, p, record) {

                return Ext.String.format('<img src=\'resources/images/icon_server24x24.png\'> {0}', value);
            }
            },
            {
                text: 'User', dataIndex: 'user', width: 100, renderer: function(value, p, record) {

                return Ext.String.format('<img src=\'resources/images/icon_user24x24.png\'> {0}', value);
            }
            },
            {
                text: 'Request Type', dataIndex: 'requestType', width: 100, renderer: function(value) {

                return value ? value.toUpperCase() : 'AJAX';
            }
            },
            {text: 'Charset', dataIndex: 'charset', width: 100},
            {text: 'Port', dataIndex: 'port', width: 60},
            {text: 'HTTP Tunneling URL', dataIndex: 'tunnelingURL', flex: 1}
        ];
    }
});