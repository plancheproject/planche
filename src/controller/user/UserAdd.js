Ext.define('Planche.controller.user.UserAdd', {
    extend: 'Ext.app.Controller',
    views : [
        'Planche.view.user.UserAdd'
    ],
    init  : function() {

        var app = this.getApplication();

        this.control({
            'user-add'           : {
                boxready: this.initUserForm
            },
            '#user-add-save-user': {
                click: this.saveUser
            },
            '#user-add-close'    : {
                click: this.close
            }
        });
    },

    initWindow: function(user, host) {

        Ext.create('Planche.view.user.UserAdd', {
            user: user,
            host: host
        });
    },

    initUserForm: function(win) {

        var app = this.getApplication(),
            user = win.getUser(),
            host = win.getHost();

        if (!(user || host)) {

            return;
        }

        app.tunneling({
            db     : '',
            query  : app.getAPIS().getQuery('SELECT_USER', user, host),
            success: function(config, response) {

                var list = Planche.DBUtil.getAssocArray(response.fields, response.records);

                Ext.getCmp('user-add-user-name').setValue(list[0]['User']);
                Ext.getCmp('user-add-host').setValue(list[0]['Host']);
                Ext.getCmp('user-add-max-questions').setValue(list[0]['max_questions']);
                Ext.getCmp('user-add-max-updates').setValue(list[0]['max_updates']);
                Ext.getCmp('user-add-max-connections').setValue(list[0]['max_connections']);
                Ext.getCmp('user-add-max-user-connections').setValue(list[0]['max_user_connections']);
            }
        });
    },

    saveUser: function(btn) {

        var app = this.getApplication(),
            win = btn.up("window"),
            api = app.getAPIS(),
            tunnelings = [],
            user = Ext.getCmp('user-add-user-name').getValue(),
            host = Ext.getCmp('user-add-host').getValue(),
            pass = Ext.getCmp('user-add-password').getValue(),
            repass = Ext.getCmp('user-add-retype-password').getValue(),
            isEdit = true,
            operOption = [],
            option = [],
            messages = [];

        if (!win.getUser() && !win.getHost()) {

            if (this.checkPassword(pass, repass) === -1) {

                return;
            }

            tunnelings.push({
                db     : '',
                query  : api.getQuery('CREATE_USER', user, host, pass),
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            });

            isEdit = false;
        }
        else {

            var result = this.checkPassword(pass, repass);

            if (result === -1) {

                return;
            }

            if (result == 1) {

                if (pass) {

                    option.push('IDENTIFIED BY "' + pass + '"');
                }
            }
        }

        //If input name is different from the old user name. It will be changing
        if (isEdit && (user != win.getUser() || host != win.getHost())) {

            tunnelings.push({
                db     : '',
                query  : api.getQuery('RENAME_USER', win.getUser(), win.getHost(), user, host),
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            });
        }


        //Add Grant "with options"
        var val = [
            Ext.getCmp('user-add-max-questions').getValue(),
            Ext.getCmp('user-add-max-updates').getValue(),
            Ext.getCmp('user-add-max-connections').getValue(),
            Ext.getCmp('user-add-max-user-connections').getValue()
        ];

        if (val[0]) {

            operOption.push('MAX_QUERIES_PER_HOUR ' + val[0]);
        }

        if (val[1]) {

            operOption.push('MAX_UPDATES_PER_HOUR ' + val[1]);
        }

        if (val[2]) {

            operOption.push('MAX_CONNECTIONS_PER_HOUR ' + val[2]);
        }

        if (val[3]) {

            operOption.push('MAX_USER_CONNECTIONS ' + val[3]);
        }

        if (operOption.length > 0) {

            option.push("WITH " + operOption.join(" "));
        }

        if (option.length > 0) {

            tunnelings.push({
                db     : '',
                query  : api.getQuery('GRANT', 'USAGE', user, host, "*.*", option.join(" ")),
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            });
        }

        app.tunnelings(tunnelings, {
            start : function(){

                win.setLoading(true);
            },
            success: function() {

                app.fireEvent('after_save_user');
                win.setLoading(false);
                win.destroy();
            },
            failure: function() {

                app.showMessage(messages);
                win.setLoading(false);
            }
        });
    },

    checkPassword: function(pass, repass) {

        if (pass || repass) {

            if (pass != repass) {

                Ext.Msg.alert('error', 'Password do not match');
                return -1;
            }
            else {

                return 1;
            }
        }

        return 0;
    },

    close: function(btn) {

        var win = btn.up("window");
        win.destroy();
    }
});
