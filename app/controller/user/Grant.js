Ext.define('Planche.controller.user.Grant', {
    extend: 'Planche.lib.SchemaTree',
    views : [
        'user.Grant',
        'user.GrantSchemaTree',
        'user.GrantUserList'
    ],
    init  : function() {

        this.callParent(arguments);

        this.setDatabasesChildren([{
            text: 'Tables',
            leaf: false
        }, {
            text: 'Views',
            leaf: false
        }, {
            text: 'Procedures',
            leaf: false
        }, {
            text: 'Functions',
            leaf: false
        }]);

        this.setTablesChildren([{
            text: 'Columns',
            leaf: false
        }]);

        var app = this.getApplication(),
            me = this;

        this.control({
            'grant'                                  : {
                boxready: this.initGrant
            },
            '#grant-add-user'                        : {
                click: this.addUser
            },
            '#grant-save-changes'                    : {
                click: this.saveChanges
            },
            '#grant-cancel-changes'                  : {
                click: this.cancelChanges
            },
            '#grant-close'                           : {
                click: this.close
            },
            'grant-priv-list'                        : {
                selectionchange: this.selectPrivList
            },
            'grant-user-list'                        : {
                select: this.selectUserList
            },
            'grant-user-list gridcolumn[text=Edit]'  : {
                click: this.editUser
            },
            'grant-user-list gridcolumn[text=Delete]': {
                click: this.deleteUser
            },
            'grant-schema-tree'                      : {
                beforeitemexpand: this.expandTree,
                reloadTree      : this.reloadTree,
                expandTree      : this.expandTree,
                select          : this.selectSchemaTree
            }
        });

        app.on('after_save_user', function() {

            me.initUserList();
        });
    },

    initWindow: function(result) {

        Ext.create('Planche.view.user.Grant', {
            application: this.getApplication()
        });
    },

    initGrant: function() {

        var tree = this.getSchemaTree(),
            node = tree.getRootNode();

        this.setRootType('global');

        this.initUserList();
        this.loadTree(node);
    },

    initUserList: function() {

        var app = this.getApplication(),
            userList = this.getUserList();

        userList.setLoading(true);
        userList.selModel.deselectAll();

        app.tunneling({
            query  : app.getAPIS().getQuery('SELECT_ALL_USER'),
            success: function(config, response) {

                var records = Planche.DBUtil.getAssocArray(response.fields, response.records);
                userList.store.loadData(records);
                userList.setLoading(false);
            }
        });
    },

    initSchemaTree: function() {

        var tree = this.getSchemaTree();

        tree.selModel.deselectAll();
        tree.selModel.select(0, true);
    },

    initPrivList: function() {

        var privList = this.getPrivList();
        privList.store.removeAll(true);
    },

    addUser: function() {

        this.getApplication().openWindow('user.UserAdd');
    },

    editUser: function(grid, rowIndex, colIndex, item, e, record) {

        this.getApplication().openWindow('user.UserAdd', record.data.User, record.data.Host);
    },

    deleteUser: function(grid, rowIndex, colIndex, item, e, record) {

        var app = this.getApplication(),
            me = this;

        Ext.Msg.confirm('confirm', 'Do you really want to delete the user?', function(res) {

            if (res == "no") {

                return;
            }

            app.tunneling({
                query  : app.getAPIS().getQuery('DELETE_USER', record.data.User, record.data.Host),
                success: function() {

                    me.initUserList();
                }
            });
        });
    },

    getSelectedUser: function() {

        var selUser = this.getUserListSelection()[0];

        if (!selUser) {

            return false;
        }

        return selUser;
    },

    saveChanges: function(btn) {

        var win = btn.up('window'),
            app = this.getApplication(),
            api = app.getAPIS(),
            me = this,
            user = this.getSelectedUser(),
            tunnelings = [],
            messages = [],
            newPrivs = user.get('priv'),
            oldPrivs = user.get('old_priv');

        if (!user) {

            Ext.Msg.Alert('No selected user');
            return;
        }

        Ext.Object.each(newPrivs, function(path, newPriv) {

            var oldPriv = oldPrivs[path] || [];

            if (Ext.Array.equals(oldPriv, newPriv)) {

                return;
            }

            var on = "",
                option = "",
                path = path.split("`"),
                type = path[0],
                func = 'get' + type.charAt(0).toUpperCase() + type.slice(1) + 'PrivItems',
                cmds = this[func](),
                grantPriv = [],
                revokePriv = [];

            Ext.Array.each(newPriv, function(val, idx) {

                if (oldPriv.indexOf(val) > -1) {

                    return;
                }

                grantPriv.push(cmds[val]);

                if (val == 'GRANT') {

                    option = "WITH " + cmds[val];
                    return;
                }
            });

            Ext.Array.each(oldPriv, function(val, idx) {

                if (newPriv.indexOf(val) > -1) {

                    return;
                }

                revokePriv.push(cmds[val]);
            });

            switch (type.toLowerCase()) {

                case "global" :

                    on = "*.*";
                    grantPriv = grantPriv.join(",");
                    revokePriv = revokePriv.join(",");
                    break;
                case "database" :

                    on = "`" + path[1] + "`.*";
                    grantPriv = grantPriv.join(",");
                    revokePriv = revokePriv.join(",");
                    break;

                case "table" :

                    on = "`" + path[1] + "`.`" + path[2] + "`";
                    grantPriv = grantPriv.join(",");
                    revokePriv = revokePriv.join(",");
                    break;

                case "view" :

                    on = "`" + path[1] + "`.`" + path[2] + "`";
                    grantPriv = grantPriv.join(",");
                    revokePriv = revokePriv.join(",");
                    break;

                case "column" :

                    on = "`" + path[1] + "`.`" + path[2] + "`";
                    grantPriv = grantPriv.length > 0 ? (path[2] + "(" + grantPriv.join(")," + path[2] + "(") + ")") : "";
                    revokePriv = revokePriv.length > 0 ? (path[2] + "(" + revokePriv.join(")," + path[2] + "(") + ")") : "";
                    break;

                case "procedure" :

                    on = "PROCEDURE `" + path[1] + "`.`" + path[2] + "`";
                    grantPriv = grantPriv.join(",");
                    revokePriv = revokePriv.join(",");
                    break;

                case "function" :

                    on = "FUNCTION `" + path[1] + "`.`" + path[2] + "`";
                    grantPriv = grantPriv.join(",");
                    revokePriv = revokePriv.join(",");
                    break;
            }

            if (grantPriv) {

                tunnelings.push({
                    query  : api.getQuery('GRANT', grantPriv, user.get('User'), user.get('Host'), on, option),
                    failure: function(config, response) {

                        messages.push(app.generateError(config.query, response.message));
                    }
                });
            }

            if (revokePriv) {

                tunnelings.push({
                    query  : api.getQuery('REVOKE', revokePriv, user.get('User'), user.get('Host'), on, option),
                    failure: function(config, response) {

                        messages.push(app.generateError(config.query, response.message));
                    }
                });
            }


        }, this);

        if (tunnelings.length == 0) {

            Ext.Msg.alert('info', 'Grants has no changes');
            return;
        }

        app.tunnelings(tunnelings, {
            start  : function() {

                win.setDisabled(true);
            },
            success: function() {

                me.initPrivList();
                me.initSchemaTree();

                Ext.Msg.alert('info', 'Successfully apply the permissions.');
                win.setDisabled(false);
            },
            failure: function() {

                app.openMessage(messages);
                win.setDisabled(false);
            }
        });
    },

    cancelChanges: function(btn) {

        this.initPrivList();
        this.initSchemaTree();
        this.initUserList();
    },

    close: function(btn) {

        btn.up("window").destroy();
    },

    selectUserList: function() {

        var me = this,
            app = me.getApplication(),
            api = app.getAPIS(),
            tree = this.getSchemaTree(),
            user = this.getSelectedUser(),
            userList = this.getUserList(),
            privList = this.getPrivList(),
            viewList = {};

        if (user.get('old_priv') && user.get('priv')) {

            me.initPrivList();
            me.initSchemaTree();
            return;
        }

        userList.setLoading(true);
        tree.setDisabled(true);
        privList.setDisabled(true);

        var settings = {},
            messages = [],
            tunnelings = [{
                query  : api.getQuery('USER_PRIV', user.get('User'), user.get('Host')),
                success: function(config, response) {

                    var records = Planche.DBUtil.getAssocArray(response.fields, response.records, true)[0],
                        path = 'global';
                    settings[path] = settings[path] || [];
                    Ext.Object.each(records, function(key, val) {

                        var idx = key.indexOf('_PRIV');
                        if (idx > -1) {

                            if (val == 'Y') {

                                settings[path].push(key.substring(0, idx));
                            }
                        }
                    });
                },
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            }, {
                query  : api.getQuery('USER_DATABASE_PRIV', user.get('User'), user.get('Host')),
                success: function(config, response) {

                    var records = Planche.DBUtil.getAssocArray(response.fields, response.records, true),
                        path = '';
                    Ext.Array.each(records, function(row) {

                        path = ['database', row.DB].join("`");
                        settings[path] = settings[path] || [];

                        Ext.Object.each(row, function(key, val) {

                            var idx = key.indexOf('_PRIV');
                            if (idx > -1) {

                                if (val == 'Y') {

                                    settings[path].push(key.substring(0, idx));
                                }
                            }
                        });
                    });
                },
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            }, {
                query  : api.getQuery('USER_TABLE_PRIV', user.get('User'), user.get('Host')),
                success: function(config, response) {

                    var records = Planche.DBUtil.getAssocArray(response.fields, response.records, true),
                        path = '',
                        type = '';
                    Ext.Array.each(records, function(row) {

                        if (!row.TABLE_PRIV) {

                            return;
                        }

                        type = viewList[row.DB].indexOf(row.TABLE_NAME) > -1 ? 'view' : 'table';

                        path = [type, row.DB, row.TABLE_NAME].join("`");
                        settings[path] = settings[path] || [];
                        settings[path] = row.TABLE_PRIV.toUpperCase().split(",");
                    });

                },
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            }, {
                query  : api.getQuery('USER_COLUMN_PRIV', user.get('User'), user.get('Host')),
                success: function(config, response) {

                    var records = Planche.DBUtil.getAssocArray(response.fields, response.records, true),
                        path = '';
                    Ext.Array.each(records, function(row) {

                        if (!row.COLUMN_PRIV) {

                            return;
                        }

                        path = ['column', row.DB, row.TABLE_NAME, row.COLUMN_NAME].join("`");
                        settings[path] = settings[path] || [];
                        settings[path] = row.COLUMN_PRIV.toUpperCase().split(",");
                    });
                },
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            }, {
                query  : api.getQuery('USER_PROC_PRIV', user.get('User'), user.get('Host')),
                success: function(config, response) {

                    var records = Planche.DBUtil.getAssocArray(response.fields, response.records, true),
                        path = '';
                    Ext.Array.each(records, function(row) {

                        if (!row.PROC_PRIV) {

                            return;
                        }

                        path = [row.ROUTINE_TYPE, row.DB, row.ROUTINE_NAME].join("`").toLowerCase();
                        settings[path] = settings[path] || [];
                        settings[path] = row.PROC_PRIV.toUpperCase().split(",");
                    });
                },
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            }];

        app.tunneling({
            query  : api.getQuery('SHOW_DATABASES'),
            success: function(config, response) {

                var records = Planche.DBUtil.getAssocArray(response.fields, response.records, true),
                    viewTunnelings = [];

                Ext.Array.each(records, function(row) {

                    var db = row.DATABASE;

                    viewList[db] = viewList[db] || [];

                    viewTunnelings.push({
                        query  : api.getQuery('SHOW_DATABASE_VIEWS', db),
                        success: function(config, response) {

                            Ext.Array.each(response.records, function(row2) {

                                viewList[db].push(row2[0]);
                            });
                        },
                        failure: function(config, response) {

                            messages.push(app.generateError(config.query, response.message));
                        }
                    });
                });

                app.tunnelings(viewTunnelings, {
                    start  : function() {

                        userList.setLoading(true);
                        tree.setDisabled(true);
                    },
                    success : function(){

                        app.tunnelings(tunnelings, {
                            success: function() {

                                user.set('old_priv', Ext.clone(settings));
                                user.set('priv', Ext.clone(settings));

                                me.initPrivList();
                                me.initSchemaTree();

                                userList.setLoading(false);
                                tree.setDisabled(false);
                            },
                            failure: function() {

                                app.openMessage(messages);

                                userList.setLoading(false);
                                tree.setDisabled(false);
                            }
                        });
                    },
                    failure: function() {

                        app.openMessage(messages);

                        userList.setLoading(false);
                        tree.setDisabled(false);
                    }
                })
            },
            failure: function(config, response) {

                messages.push(app.generateError(config.query, response.message));
            }
        });
    },

    selectPrivList: function() {

        var user = this.getSelectedUser(),
            selTree = this.getSchemaTreeSelection(),
            privList = this.getPrivList(),
            selectedPrivs = privList.selModel.getSelection().map(function(model) {

                return model.get('priv');
            }),

            settings = user.get('priv');

        settings[selTree[0].raw.path] = selectedPrivs;

        user.set('priv', settings);

        this.getSaveChangeBtn().setDisabled(false);
    },

    selectSchemaTree: function(tree, record, index) {

        var me = this,
            privList = this.getPrivList(),
            user = this.getSelectedUser(),
            type = record.raw.type,
            path = record.raw.path,
            records = [];

        privList.setDisabled(true);

        if (!type) {

            privList.store.loadData(records);
            privList.setDisabled(false);
            return;
        }

        var func = 'get' + type.charAt(0).toUpperCase() + type.slice(1) + 'PrivItems';
        Ext.Object.each(me[func](), function(priv, cmd) {

            records.push({
                priv: priv,
                cmd : cmd
            });
        });

        try {

            priv = user.get('priv')[path] || [];
        }
        catch (e) {

            priv = [];
        }


        privList.store.loadData(records);

        var selModel = privList.selModel;

        Ext.Array.each(records, function(row, idx) {

            if (priv.indexOf(row.priv) > -1) {

                selModel.select(idx, true);
            }
        });

        privList.store.sync();

        if (user) {

            privList.setDisabled(false);
        }
    },

    getUserList: function() {

        return Ext.getCmp('grant-user-list');
    },

    getUserListSelection: function() {

        return this.getUserList().selModel.getSelection();
    },

    getSchemaTree: function() {

        return Ext.getCmp('grant-schema-tree');
    },

    getSchemaTreeSelection: function() {

        return this.getSchemaTree().selModel.getSelection();
    },

    getPrivList: function() {

        return Ext.getCmp('grant-priv-list');
    },

    getPrivListSelection: function() {

        return this.getPrivList().selModel.getSelection();
    },

    getSaveChangeBtn: function() {

        return Ext.getCmp('grant-save-changes');
    },

    getCancelChangeBtn: function() {

        return Ext.getCmp('grant-cancel-changes');
    },

    getGlobalPrivItems: function() {

        return {
            'ALTER'            : 'ALTER',
            'ALTER_ROUTINE'    : 'ALTER ROUTINE',
            'CREATE'           : 'CREATE',
            'CREATE_ROUTINE'   : 'CREATE ROUTINE',
            'CREATE_TABLESPACE': 'CREATE TABLESPACE',
            'CREATE_TMP_TABLE' : 'CREATE TEMPORARY TABLES',
            'CREATE_USER'      : 'CREATE USER',
            'CREATE_VIEW'      : 'CREATE VIEW',
            'DELETE'           : 'DELETE',
            'DROP'             : 'DROP',
            'EVENT'            : 'EVENT',
            'EXECUTE'          : 'EXECUTE',
            'FILE'             : 'FILE',
            'INDEX'            : 'INDEX',
            'INSERT'           : 'INSERT',
            'LOCK_TABLES'      : 'LOCK TABLES',
            'PROCESS'          : 'PROCESS',
            'REFERENCES'       : 'REFERENCES',
            'RELOAD'           : 'RELOAD',
            'REPL_CLIENT'      : 'REPLICATION CLIENT',
            'REPL_SLAVE'       : 'REPLICATION SLAVE',
            'SELECT'           : 'SELECT',
            'SHOW_DATABASES'          : 'SHOW DATABASES',
            'SHOW_VIEW'        : 'SHOW VIEW',
            'SHUTDOWN'         : 'SHUTDOWN',
            'SUPER'            : 'SUPER',
            'TRIGGER'          : 'TRIGGER',
            'UPDATE'           : 'UPDATE',
            'GRANT'            : 'GRANT OPTION'
        };
    },

    getDatabasePrivItems: function() {

        return {
            'ALTER'           : 'ALTER',
            'ALTER_ROUTINE'   : 'ALTER ROUTINE',
            'CREATE'          : 'CREATE',
            'CREATE_ROUTINE'  : 'CREATE ROUTINE',
            'CREATE_TMP_TABLE': 'CREATE TEMPORARY TABLES',
            'CREATE_VIEW'     : 'CREATE VIEW',
            'DELETE'          : 'DELETE',
            'DROP'            : 'DROP',
            'EVENT'           : 'EVENT',
            'EXECUTE'         : 'EXECUTE',
            'INDEX'           : 'INDEX',
            'INSERT'          : 'INSERT',
            'LOCK_TABLES'     : 'LOCK TABLES',
            'REFERENCES'      : 'REFERENCES',
            'SELECT'          : 'SELECT',
            'SHOW_VIEW'       : 'SHOW VIEW',
            'TRIGGER'         : 'TRIGGER',
            'UPDATE'          : 'UPDATE',
            'GRANT'           : 'GRANT OPTION'
        };
    },

    getTablePrivItems: function() {

        return {
            'ALTER'      : 'ALTER',
            'CREATE'     : 'CREATE',
            'CREATE VIEW': 'CREATE VIEW',
            'DELETE'     : 'DELETE',
            'DROP'       : 'DROP',
            'GRANT'      : 'GRANT OPTION',
            'INDEX'      : 'INDEX',
            'INSERT'     : 'INSERT',
            'REFERENCES' : 'REFERENCES',
            'SELECT'     : 'SELECT',
            'SHOW_VIEW'  : 'SHOW VIEW',
            'TRIGGER'    : 'TRIGGER',
            'UPDATE'     : 'UPDATE'
        };
    },

    getColumnPrivItems: function() {

        return {
            'INSERT'    : 'INSERT',
            'REFERENCES': 'REFERENCES',
            'SELECT'    : 'SELECT',
            'UPDATE'    : 'UPDATE'
        };
    },

    getViewPrivItems: function() {

        return {
            'ALTER'      : 'ALTER',
            'CREATE'     : 'CREATE',
            'CREATE VIEW': 'CREATE VIEW',
            'DELETE'     : 'DELETE',
            'DROP'       : 'DROP',
            'GRANT'      : 'GRANT OPTION',
            'INDEX'      : 'INDEX',
            'INSERT'     : 'INSERT',
            'REFERENCES' : 'REFERENCES',
            'SELECT'     : 'SELECT',
            'SHOW VIEW'  : 'SHOW VIEW',
            'TRIGGER'    : 'TRIGGER',
            'UPDATE'     : 'UPDATE'
        };
    },

    getProcedurePrivItems: function() {

        return {
            'ALTER ROUTINE': 'ALTER ROUTINE',
            'EXECUTE'      : 'EXECUTE',
            'GRANT'        : 'GRANT OPTION'
        };
    },

    getFunctionPrivItems: function() {

        return {
            'ALTER ROUTINE': 'ALTER ROUTINE',
            'EXECUTE'      : 'EXECUTE',
            'GRANT'        : 'GRANT OPTION'
        };
    }
});