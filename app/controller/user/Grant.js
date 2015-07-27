Ext.define('Planche.controller.user.Grant', {
    extend: 'Planche.lib.SchemaTree',
    views : [
        'user.Grant',
        'user.GrantSchemeTree',
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
                selectionchange : this.selectPrivList
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
            'grant-scheme-tree'                      : {
                beforeitemexpand: this.expandTree,
                reloadTree      : this.reloadTree,
                expandTree      : this.expandTree,
                select          : this.selectSchemeTree
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
            db     : '',
            query  : app.getAPIS().getQuery('SELECT_ALL_USER'),
            success: function(config, response) {

                var records = app.getAssocArray(response.fields, response.records);
                userList.store.loadData(records);

                userList.setLoading(false);
            }
        });
    },

    initSchemeTree: function() {

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
                db     : '',
                query  : app.getAPIS().getQuery('DELETE_USER', record.data.User, record.data.Host),
                success: function(config, response) {

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
            queries = [],
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

            var privileges = [],
                on = "",
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

                queries.push(api.getQuery('GRANT', grantPriv, user.get('User'), user.get('Host'), on, option));
            }

            if (revokePriv) {

                queries.push(api.getQuery('REVOKE', revokePriv, user.get('User'), user.get('Host'), on, option));
            }


        }, this);

        if (queries.length == 0) {

            win.setDisabled(false);
            Ext.Msg.alert('info', 'Grants has no changes');
            return;
        }

        app.multipleTunneling('', queries, {
            prevAllQueries : function(queries) {

                win.setDisabled(true);
            },
            failureQuery   : function(idx, query, config, response) {

                messages.push(app.generateError(query, response.message));
            },
            afterAllQueries: function(queries, results) {

                win.setDisabled(false);

                me.initPrivList();
                me.initSchemeTree();

                Ext.Msg.alert('info', 'Successfully apply the permissions.');

                if (messages.length > 0) {

                    app.openMessage(messages);
                }
            }
        });
    },

    cancelChanges: function(btn) {

        this.initPrivList();
        this.initSchemeTree();
        this.initUserList();
    },

    close: function(btn) {

        btn.up("window").destroy();
    },

    selectUserList: function(grid, selModel, rowIndex) {

        var me = this,
            app = me.getApplication(),
            api = app.getAPIS(),
            tree = this.getSchemaTree(),
            user = this.getSelectedUser(),
            userList = this.getUserList(),
            privList = this.getPrivList(),
            messages = [],
            queries = [];

        if (user.get('old_priv') && user.get('priv')) {

            me.initPrivList();
            me.initSchemeTree();
            return;
        }

        tree.setLoading(true);
        userList.setLoading(true);
        privList.setDisabled(true);

        queries.push(api.getQuery('USER_PRIV', user.get('User'), user.get('Host')));
        queries.push(api.getQuery('USER_DATABASE_PRIV', user.get('User'), user.get('Host')));
        queries.push(api.getQuery('USER_TABLE_PRIV', user.get('User'), user.get('Host')));
        queries.push(api.getQuery('USER_COLUMN_PRIV', user.get('User'), user.get('Host')));
        queries.push(api.getQuery('USER_PROC_PRIV', user.get('User'), user.get('Host')));

        var settings = {},
            records = [],
            path = "";

        app.multipleTunneling('', queries, {
            prevAllQueries : function(queries) {

                tree.setDisabled(false);
            },
            failureQuery   : function(idx, query, config, response) {

                messages.push(app.generateError(query, response.message));
            },
            afterAllQueries: function(queries, results) {

                records = app.getAssocArray(results[0].response.fields, results[0].response.records, true)[0];
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

                records = app.getAssocArray(results[1].response.fields, results[1].response.records, true);
                Ext.Array.each(records, function(row, idx) {

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

                records = app.getAssocArray(results[2].response.fields, results[2].response.records, true);
                Ext.Array.each(records, function(row, idx) {

                    if (!row.TABLE_PRIV) {

                        return;
                    }

                    path = ['table', row.DB, row.TABLE_NAME].join("`");
                    settings[path] = settings[path] || [];
                    settings[path] = row.TABLE_PRIV.toUpperCase().split(",");
                });

                records = app.getAssocArray(results[3].response.fields, results[3].response.records, true);
                Ext.Array.each(records, function(row, idx) {

                    if (!row.COLUMN_PRIV) {

                        return;
                    }

                    path = ['column', row.DB, row.TABLE_NAME, row.COLUMN_NAME].join("`");
                    settings[path] = settings[path] || [];
                    settings[path] = row.COLUMN_PRIV.toUpperCase().split(",");
                });

                records = app.getAssocArray(results[4].response.fields, results[4].response.records, true);
                Ext.Array.each(records, function(row, idx) {

                    if (!row.PROC_PRIV) {

                        return;
                    }

                    path = [row.ROUTINE_TYPE, row.DB, row.ROUTINE_NAME].join("`");
                    settings[path] = settings[path] || [];
                    settings[path] = row.PROC_PRIV.toUpperCase().split(",");
                });

                user.set('old_priv', Ext.clone(settings));
                user.set('priv', Ext.clone(settings));

                me.initPrivList();
                me.initSchemeTree();

                userList.setLoading(false);
                tree.setLoading(false);

                if (messages.length > 0) {

                    app.openMessage(messages);
                }
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

    selectSchemeTree: function(tree, record, index) {

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

    getSchemaTree : function(){

        return Ext.getCmp('grant-scheme-tree');
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
            'REPL_CLIENT'      : 'REPL CLIENT',
            'REPL_SLAVE'       : 'REPL SLAVE',
            'SELECT'           : 'SELECT',
            'SHOW_DB'          : 'SHOW DB',
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
            'CREATE_VIEW': 'CREATE VIEW',
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
            'CREATE_VIEW': 'CREATE VIEW',
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

    getProcedurePrivItems: function() {

        return {
            'ALTER_ROUTINE': 'ALTER ROUTINE',
            'EXECUTE'      : 'EXECUTE',
            'GRANT'        : 'GRANT OPTION'
        };
    },

    getFunctionPrivItems: function() {

        return {
            'ALTER_ROUTINE': 'ALTER ROUTINE',
            'EXECUTE'      : 'EXECUTE',
            'GRANT'        : 'GRANT OPTION'
        };
    }
});