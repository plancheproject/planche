Ext.define('Planche.controller.connection.NewConnect', {
    extend    : 'Ext.app.Controller',
    mode      : 'add',
    initWindow: function(connInfo) {

        Ext.create('Planche.lib.Window', {
            id        : 'new-conn-window',
            stateful  : true,
            title     : 'Add New Connection',
            layout    : 'fit',
            bodyStyle : "background-color:#FFFFFF",
            width     : 500,
            height    : 400,
            overflowY : 'auto',
            autoScroll: true,
            modal     : true,
            plain     : true,
            fixed     : true,
            shadow    : false,
            autoShow  : true,
            constrain : true,
            items     : {
                xtype   : 'form',
                id      : 'new-conn-form',
                layout  : 'vbox',
                width   : '100%',
                height  : '100%',
                padding : '5 5 5 5',
                border  : false,
                defaults: {
                    labelWidth: 100,
                    width     : '100%',
                    anchor    : '100%',
                    xtype     : 'textfield',
                    labelPad  : 5
                },
                items   : [{
                    xtype     : 'hiddenfield',
                    id        : 'new-conn-into',
                    name      : 'new-conn-into',
                    value     : 'localstorage',
                    allowBlank: false
                }, {
                    xtype     : 'hiddenfield',
                    id        : 'new-conn-index',
                    name      : 'new-conn-index',
                    value     : 0,
                    allowBlank: false
                }, {
                    xtype     : 'textfield',
                    fieldLabel: 'Host Name',
                    id        : 'new-conn-hostName',
                    name      : 'new-conn-hostName',
                    emptyText : 'New Connection Host Name',
                    allowBlank: false
                }, {
                    xtype     : 'textfield',
                    fieldLabel: 'Tunneling URL',
                    emptyText : 'http://localhost:8888/',
                    id        : 'new-conn-tunnelingURL',
                    name      : 'new-conn-tunnelingURL',
                    allowBlank: false
                }, {
                    xtype      : 'radiogroup',
                    fieldLabel : 'Request Type',
                    defaultType: 'radiofield',
                    id         : 'new-conn-requestType',
                    padding    : '0px 10px 5px 0px',
                    layout     : 'hbox',
                    items      : [
                        {
                            boxLabel  : 'JSONP',
                            name      : 'new-conn-requestType',
                            inputValue: 'jsonp',
                            margin    : '0px 10px 0px 0px',
                            checked   : true
                        }, {
                            boxLabel  : 'AJAX',
                            name      : 'new-conn-requestType',
                            inputValue: 'ajax'
                        }
                    ]
                }, {
                    xtype     : 'textfield',
                    fieldLabel: 'Host',
                    id        : 'new-conn-host',
                    name      : 'new-conn-host',
                    emptyText : 'localhost',
                    allowBlank: false
                }, {
                    xtype     : 'textfield',
                    fieldLabel: 'User',
                    id        : 'new-conn-user',
                    name      : 'new-conn-user',
                    allowBlank: false
                }, {
                    xtype     : 'textfield',
                    fieldLabel: 'Password',
                    inputType : 'password',
                    id        : 'new-conn-pass',
                    name      : 'new-conn-pass',
                    allowBlank: false
                }, {
                    xtype     : 'textfield',
                    fieldLabel: 'Charset',
                    id        : 'new-conn-charset',
                    name      : 'new-conn-charset',
                    value     : 'utf8',
                    allowBlank: false
                }, {
                    xtype     : 'textfield',
                    fieldLabel: 'Port',
                    id        : 'new-conn-port',
                    name      : 'new-conn-port',
                    value     : 3306,
                    allowBlank: false
                }, {
                    xtype      : 'radiogroup',
                    fieldLabel : 'DBMS',
                    defaultType: 'radiofield',
                    id         : 'new-conn-dbms',
                    padding    : '0px 10px 5px 0px',
                    layout     : 'hbox',
                    items      : [
                        {
                            boxLabel  : 'MySQL',
                            name      : 'new-conn-dbms',
                            inputValue: 'mysql',
                            checked   : true,
                            margin    : '0px 10px 0px 0px'
                        }
                    ]
                }, {
                    xtype      : 'radiogroup',
                    fieldLabel : 'Auto Connection',
                    defaultType: 'radiofield',
                    id         : 'new-conn-autoConnection',
                    padding    : '0px 10px 5px 0px',
                    layout     : 'hbox',
                    items      : [
                        {
                            boxLabel  : 'Yes',
                            name      : 'new-conn-autoConnection',
                            inputValue: true,
                            margin    : '0px 10px 0px 0px'
                        }, {
                            boxLabel  : 'No',
                            name      : 'new-conn-autoConnection',
                            inputValue: false,
                            checked   : true
                        }
                    ]
                }]
            },
            buttons   : [{
                text   : 'Add New Connection',
                id     : 'add-new-conn-btn',
                scope  : this,
                handler: this.save
            }, {
                text   : 'Cancel',
                scope  : this,
                handler: this.cancel
            }],
            listeners : {
                scope   : this,
                boxready: function() {

                    if (!connInfo) {

                        this.mode = 'add';
                        return;
                    }

                    this.mode = 'edit';

                    var title = 'Save connection into local storage';
                    if (connInfo.raw.into == 'hostfile') {

                        title = 'Add new connection into local storage';
                        this.mode = 'add';
                    }

                    Ext.getCmp('add-new-conn-btn').setText(title);

                    var values = {},
                        form   = this.getForm();

                    Ext.Object.each(connInfo.raw, function(key, val) {

                        values['new-conn-' + key] = val;
                    });

                    form.setValues(values);
                }
            }
        });
    },

    getForm: function() {

        return Ext.getCmp('new-conn-form').getForm();
    },

    save: function(btn) {

        var me = this,
            form   = me.getForm(),
            values = form.getValues(),
            win    = btn.up("window"),
            app    = me.getApplication();

        Planche.lib.Setting.getHosts(function(hosts){

            var newValues = {};

            Ext.Object.each(values, function(key, val) {

                newValues[key.substring(9)] = val;
            });

            if (me.mode == 'add') {

                newValues['index'] = hosts.length + 1;
                hosts.push(newValues);
            }
            else if (me.mode == 'edit') {

                hosts[newValues['index']] = newValues;
            }

            Planche.lib.Setting.setHosts(hosts, function(){

                app.fireEvent('initHosts');
            });

            win.destroy();

            Ext.getCmp('edit-conn-btn').setDisabled(true);
            Ext.getCmp('del-conn-btn').setDisabled(true);
            Ext.getCmp('conn-btn').setDisabled(true);
            Ext.getCmp('test-conn-btn').setDisabled(true);
        });
    },

    cancel: function(btn) {

        var win = btn.up("window");
        win.destroy();
    }
});
