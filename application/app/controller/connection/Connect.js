Ext.define('Planche.controller.connection.Connect', {
    extend    : 'Ext.app.Controller',
    tmpCopy   : null,
    initWindow: function() {

        var app = this.getApplication(),
            columns = this.makeListColumns(),
            fields = [];

        Ext.each(columns, function(obj) {

            fields.push(obj.dataIndex);
        });

        this.store = Ext.create('Ext.data.Store', {
            fields: fields
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            id         : 'connect-grid',
            border     : false,
            columnLines: true,
            width      : '100%',
            flex       : 1,
            columns    : columns,
            store      : this.store,
            listeners  : {
                scope       : this,
                select      : function(grid, record) {

                    if (record.raw.into == 'localstorage') {

                        Ext.getCmp('edit-conn-btn').setDisabled(false);
                        Ext.getCmp('del-conn-btn').setDisabled(false);
                    }
                    else {

                        Ext.getCmp('edit-conn-btn').setDisabled(true);
                        Ext.getCmp('del-conn-btn').setDisabled(true);
                    }

                    Ext.getCmp('conn-btn').setDisabled(false);
                    Ext.getCmp('test-conn-btn').setDisabled(false);
                },
                itemdblclick: this.connect,
                cellkeydown : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                    if (e.keyCode === Ext.EventObject.ENTER) {

                        this.connect();
                    }
                }
            }
        });


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
            items     : this.grid,
            buttons   : [{
                text    : 'Connect',
                id      : 'conn-btn',
                disabled: true,
                scope   : this,
                handler : this.connect
            }, {
                text    : 'Test Connect',
                id      : 'test-conn-btn',
                disabled: true,
                scope   : this,
                handler : this.testConnect
            }, {
                text   : 'Add New Connnection',
                scope  : this,
                handler: this.newConnect
            }, {
                text    : 'Edit Connnection',
                id      : 'edit-conn-btn',
                disabled: true,
                scope   : this,
                handler : this.editConnect
            }, {
                text    : 'Del Connnection',
                id      : 'del-conn-btn',
                disabled: true,
                scope   : this,
                handler : this.delConnect
            }],
            listeners : {
                scope   : this,
                boxready: function() {

                    this.initHosts();
                    this.initKeyMap();
                }
            }
        });

        app.on('initHosts', this.initHosts, this);
    },

    initHosts: function() {

        var app = this.getApplication(),
            hosts = app.getHosts();

        this.store.loadData(hosts);

        Ext.getCmp('edit-conn-btn').setDisabled(true);
        Ext.getCmp('del-conn-btn').setDisabled(true);
    },
    connect  : function() {

        var me = this,
            app = me.getApplication();

        this.ping(function() {

            var win = me.getConnectWindow(),
                conn = me.getSelectedConnection();

            conn.raw.requestType = window.location.protocol == 'file:' ? 'jsonp' : conn.raw.requestType;
            app.initConnectTab(conn.raw);

            win.destroy();
        });
    },

    testConnect: function() {

        var me = this;

        this.ping(function() {

            var win = me.getConnectWindow();
            win.setLoading(false);

            Ext.Msg.alert('Info', 'Connection is successful');
        });
    },

    newConnect: function() {

        if (typeof localStorage == 'undefined') {

            Ext.Msg.alert('notice', 'Your browser does not support local storage');
            return;
        }

        var app = this.getApplication();
        app.openWindow('connection.NewConnect');
    },

    editConnect: function() {

        if (typeof localStorage == 'undefined') {

            Ext.Msg.alert('notice', 'Your browser does not support local storage');
            return;
        }

        var app = this.getApplication(),
            conn = this.getSelectedConnection();

        app.openWindow('connection.NewConnect', conn);
    },

    delConnect : function(){

        var app = this.getApplication(),
            conn = this.getSelectedConnection(),
            hosts = app.getHostsInStorage();

        hosts.splice(conn.raw.index, 1);

        app.setHostsInStorage(hosts);
    },

    ping: function(callback) {

        var win = this.getConnectWindow(),
            app = this.getApplication(),
            conn = this.getSelectedConnection();

        win.setLoading(true);

        app.tunneling(Ext.apply({
            query  : 'SELECT 1',
            timeout: 5000,
            success: function(config, response) {

                callback();
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
                win.setLoading(false);
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
                text: 'Req.Type', dataIndex: 'requestType', width: 60, renderer: function(value) {

                return value ? value.toUpperCase() : 'JSONP';
            }
            },
            {text: 'Save in', dataIndex: 'into', width: 80},
            {text: 'Charset', dataIndex: 'charset', width: 50},
            {text: 'Port', dataIndex: 'port', width: 40},
            {text: 'HTTP Tunneling URL', dataIndex: 'tunnelingURL', flex: 1}
        ];
    },

    copyHost: function() {

        if (typeof localStorage == 'undefined') {

            Ext.Msg.alert('notice', 'Your browser does not support local storage');
            return;
        }

        this.tmpCopy = Ext.clone(this.getSelectedConnection().raw);
    },

    pasteHost: function() {

        if(!this.tmpCopy){

            return;
        }

        var app = this.getApplication(),
            hosts = app.getHostsInStorage();

        this.tmpCopy['index'] = hosts.length;

        hosts.push(this.tmpCopy);

        app.setHostsInStorage(hosts);

        this.tmpCopy = null;
    },

    initKeyMap: function() {

        var map = new Ext.util.KeyMap({
            target : Ext.getCmp('connect-grid').getEl(),
            binding: [{
                scope: this,
                key  : Ext.EventObject.C,
                ctrl : true,
                fn   : this.copyHost
            }, {
                scope: this,
                key  : Ext.EventObject.V,
                ctrl : true,
                fn   : this.pasteHost
            }]
        });
    }
});