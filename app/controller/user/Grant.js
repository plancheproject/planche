Ext.define('Planche.controller.user.Grant', {
    extend: 'Ext.app.Controller',
    views : [
        'user.Grant',
        'user.GrantSchemeTree',
        'user.GrantUserList'
    ],
    init  : function () {

        var app = this.getApplication(),
            me = this;

        this.control({
            'grant': {
                boxready: this.initUserList
            },
            '#grant-add-user' : {
                click: this.addUser
            },
            '#grant-save-changes' : {
                click: this.saveChanages
            },
            '#grant-cancel-changes' : {
                click: this.cancelChanges
            },
            '#grant-grant-close' : {
                click: this.close
            },
            'grant-user-list' : {
                select : this.selectGrantUserList
            },
            'grant-user-list gridcolumn[text=Edit]' : {
                click: this.editUser
            },
            'grant-user-list gridcolumn[text=Delete]' : {
                click: this.deleteUser
            },
            'grant-scheme-tree': {
                beforeitemexpand: this.expandTree,
                reloadTree      : this.reloadTree,
                expandTree      : this.expandTree,
                select          : this.selectGrantSchemeTree,
                boxready        : this.initGrantSchemeTree
            }
        });

        app.on('after_save_user', function(){

            me.initUserList();
        });
    },

    initWindow: function (result) {

        Ext.create('Planche.view.user.Grant', {
            application : this.getApplication()
        });
    },

    initUserList: function () {

        var app = this.getApplication();

        app.tunneling({
            db     : '',
            query  : app.getAPIS().getQuery('SELECT_ALL_USER'),
            success: function (config, response) {

                var list = app.getAssocArray(response.fields, response.records);
                Ext.getCmp('grant-user-list').store.loadData(list);
            }
        });
    },

    addUser : function(){

        this.getApplication().openWindow('user.UserAdd');
    },

    editUser : function (grid, rowIndex, colIndex, item, e, record) {

        this.getApplication().openWindow('user.UserAdd', record.data.User, record.data.Host);
    },

    deleteUser : function (grid, rowIndex, colIndex, item, e, record) {

        var app = this.getApplication(),
            me = this;

        Ext.Msg.confirm('confirm', 'Do you really want to delete the user?', function(res){

            if(res == "no") {

                return;
            }

            app.tunneling({
                db     : '',
                query  : app.getAPIS().getQuery('DELETE_USER', record.data.User, record.data.Host),
                success: function (config, response) {

                    me.initUserList();
                }
            });
        });
    },

    saveChanages : function(btn) {

        //GRANT {2} ON  *.* TO `{0}`@`{1}` WITH GRANT OPTION;
    },

    cancelChanages : function(btn) {

    },

    close : function(btn) {

    },

    initGrantSchemeTree : function (tree) {

        var task = new Ext.util.DelayedTask();
        task.delay(100, function () {

            var node = tree.getRootNode();

            tree.getSelectionModel().select(node);

            this.loadTree(node);

        }, this);
    },

    selectGrantUserList : function(){

        var tree = Ext.getCmp('grant-scheme-tree');
        tree.setDisabled(false);
    },


    selectGrantSchemeTree: function (view) {

        var app = this.getApplication(),
            treeview = view.views[0],
            tree = treeview.up("treepanel"),
            treeSelection = tree.selModel.getSelection(),
            grantPrivList = Ext.getCmp('grant-priv-list'),
            grantUserList = Ext.getCmp('grant-user-list'),
            grantUserSelection = grantUserList.selModel.getSelection();

        if (treeSelection.length == 0 || grantUserSelection.length == 0) {

            return;
        }

        var selModel = treeSelection[0],
            type = selModel.raw.type,
            records = [];

        try {

            type = type.charAt(0).toUpperCase() + type.slice(1);

            Ext.Object.each(this['get'+type+'PrivItems'](), function(idx, val){

                records.push({
                    selected : false,
                    priv : val
                });
            });
        }
        catch(e){


        }

        grantPrivList.store.loadData(records);

        var priv = Ext.getCmp('grant-priv-list');
        priv.setDisabled(false);
    },

    expandTree: function (node) {

        if (node.childNodes.length > 0) { return; }
        this.loadTree(node);
    },

    loadTree: function (node) {


        var loadFunc = this['load' + (node.isRoot() ? 'Databases' : node.data.text.replace(/\s/gi, ''))];

        if (loadFunc) {

            node.removeAll();
            Ext.Function.bind(loadFunc, this)(node);
        }
    },

    reloadTree: function (node) {

        this.loadTree(node);
    },

    loadDatabases: function (node) {

        var app = this.application,
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            query  : app.getAPIS().getQuery('SHOW_DATABASE'),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        type    : 'database',
                        text    : row[0],
                        icon    : 'resources/images/icon_database.png',
                        leaf    : false,
                        children: [{
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
                        }]
                    });
                });

                if (children.length == 0) { return; }

                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadTables: function (node) {

        var app = this.application,
            db = node.parentNode.data.text,
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_ALL_TABLE_STATUS', db),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    if (row[1] == 'NULL') { return; }

                    children.push({
                        type    : 'table',
                        text    : row[0],
                        icon    : 'resources/images/icon_table.png',
                        leaf    : false,
                        children: [{
                            text: 'Columns',
                            leaf: false
                        }]
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadViews: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_VIEWS', db),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        type: 'view',
                        text: row[0],
                        leaf: true
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadProcedures: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_PROCEDURES', db),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        type: 'procedure',
                        text: row[1],
                        leaf: true
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadFunctions: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_FUNCTIONS', db),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        type: 'function',
                        text: row[1],
                        leaf: true
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },


    loadColumns: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tb = node.parentNode.data.text,
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_FULL_FIELDS', db, tb),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        type: 'column',
                        text: row[0] + ' ' + row[1],
                        icon: 'resources/images/icon_' + (row[4] == 'PRI' ? 'primary' : 'column') + '.png',
                        leaf: true,
                        qtip: row[8]
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    getGlobalPrivItems: function () {

        return [
            'ALTER',
            'ALTER_ROUTINE',
            'CREATE',
            'CREATE_ROUTINE',
            'CREATE_TABLESPACE',
            'CREATE_TMP_TABLE',
            'CREATE_USER',
            'CREATE_VIEW',
            'DELETE',
            'DROP',
            'EVENT',
            'EXECUTE',
            'FILE',
            'GRANT',
            'INDEX',
            'INSERT',
            'LOCK_TABLES',
            'PROCESS',
            'REFERENCES',
            'RELOAD',
            'REPL_CLIENT',
            'REPL_SLAVE',
            'SELECT',
            'SHOW_DB',
            'SHOW_VIEW',
            'SHUTDOWN',
            'SUPER',
            'TRIGGER',
            'UPDATE'
        ];
    },

    getDatabasePrivItems: function () {

        return [
            'ALTER',
            'ALTER_ROUTINE',
            'CREATE',
            'CREATE_ROUTINE',
            'CREATE_TABLESPACE',
            'CREATE_TMP_TABLE',
            'CREATE_USER',
            'CREATE_VIEW',
            'DELETE',
            'DROP',
            'EVENT',
            'EXECUTE',
            'GRANT',
            'INDEX',
            'INSERT',
            'LOCK_TABLES',
            'REFERENCES',
            'SELECT',
            'SHOW_VIEW',
            'TRIGGER',
            'UPDATE'
        ];
    },

    getTablePrivItems: function () {

        return [
            'ALTER',
            'CREATE',
            'CREATE_VIEW',
            'DELETE',
            'DROP', ,
            'GRANT',
            'INDEX',
            'INSERT',
            'REFERENCES',
            'SELECT',
            'SHOW_VIEW',
            'TRIGGER',
            'UPDATE'
        ];
    },

    getColumnPrivItems: function () {

        return [
            'INSERT',
            'REFERENCES',
            'SELECT',
            'UPDATE'
        ];
    },

    getViewPrivItems: function () {

        return [
            'ALTER',
            'CREATE',
            'CREATE_VIEW',
            'DELETE',
            'DROP', ,
            'GRANT',
            'INDEX',
            'INSERT',
            'REFERENCES',
            'SELECT',
            'SHOW_VIEW',
            'TRIGGER',
            'UPDATE'
        ];
    },

    getProcedurePrivItems: function () {

        return [
            'ALTER_ROUTINE',
            'EXECUTE',
            'GRANT'
        ];
    },

    getFunctionPrivItems: function () {

        return [
            'ALTER_ROUTINE',
            'EXECUTE',
            'GRANT'
        ];
    }
});