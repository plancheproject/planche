Ext.application({
    name: 'Planche',

    extend            : 'Planche.Application',
    history           : [],
    autoCreateViewport: true,

    /**
     * launch planche
     *
     * @class Ext.application
     * @constructor
     */
    launch: function() {

        // setup the state provider, all state information will be saved to a cookie
        Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

        //stop backspace
        Ext.EventManager.addListener(Ext.getBody(), 'keydown', function(e) {

            if (e.getTarget().type !== 'text' && e.getKey() === '8') {
                e.preventDefault();
            }
        });

        window.onbeforeunload = function() {

            var message = "Are you sure you want to quit planche?"
            return message;
        }

        this.initKeyMap();
    },

    /**
     /**
     * Return context menu component of scheme tree in left side bar
     *
     * @access public
     * @method getSchemeContextMenu
     */
    getSchemeContextMenu: function() {

        return Ext.getCmp('scheme-context-menu');
    },

    /**
     * Return toolbar component
     *
     * @access public
     * @method getToolBar
     */
    getToolBar: function() {

        return Ext.getCmp('planche-toolbar');
    },

    /**
     * Return connect tabpanel
     *
     * @access public
     * @method getConnectTabPanel
     */
    getConnectTabPanel: function() {

        return Ext.getCmp('connect-tab-panel');
    },

    /**
     * Return active connected tab
     *
     * @access public
     * @method getActiveConnectTab
     */
    getActiveConnectTab: function() {

        var mainTab = this.getConnectTabPanel();
        return mainTab.getActiveTab();
    },


    /**
     * Close the active connection tab
     *
     * @access public
     * @method closeActiveConnectionTab
     */
    closeActiveConnectionTab: function() {

        var tab = this.getActiveConnectTab();
        if (!tab) return;

        tab.destroy();
    },

    /**
     * Return active query tabpanel in active connect tab
     *
     * @access public
     * @method getQueryTabPanel
     */
    getQueryTabPanel: function() {
        try {

            return this.getActiveConnectTab().down("tabpanel");
        }
        catch (e) {
            return null;
        }
    },

    /**
     * Return active query tab in active query tabpanel
     *
     * @access public
     * @method getActiveQueryTab
     */
    getActiveQueryTab: function() {

        try {
            return this.getQueryTabPanel().getActiveTab();
        }
        catch (e) {
            return null;
        }
    },

    /**
     * Return active result tab in active query tab
     *
     * @access public
     * @method getActiveResultTabPanel
     */
    getActiveResultTabPanel: function() {

        try {

            return this.getActiveQueryTab().down('tabpanel');
        }
        catch (e) {

            return null;
        }
    },

    /**
     * destory active result tab in active result tabpanel
     *
     * @access public
     * @method getActiveResultTabPanel
     */
    removeResultTabPanel: function() {

        var tabpanel = this.getActiveResultTabPanel();
        tabpanel.items.each(function(cmp, idx) {
            if (idx > 3) cmp.destroy()
        });
    },

    /**
     * Return query editor in active query tab
     *
     * @access public
     * @method getActiveResultTabPanel
     */
    getActiveEditor: function() {

        try {
            return this.getActiveQueryTab().down('query-editor').getEditor();
        }
        catch (e) {
            return null;
        }
    },

    getActiveTableDataTab: function() {

        try {
            return this.getActiveQueryTab().down("table-data-tab");
        }
        catch (e) {
            return null;
        }
    },

    getActiveInfoTab: function() {

        try {
            return this.getActiveQueryTab().down("info-tab");
        }
        catch (e) {
            return null;
        }
    },

    getActiveHistoryTab: function() {

        try {
            return this.getActiveQueryTab().down("history-tab").getEditor();
        }
        catch (e) {
            return null;
        }
    },

    getActiveMessageTab: function() {

        try {
            return this.getActiveQueryTab().down("message-tab");
        }
        catch (e) {
            return null;
        }
    },

    getAPIS: function() {

        return this.getActiveConnectTab().getAPIS();
    },

    getSelectedTree: function() {

        return Planche.selectedTree;
    },

    setSelectedTree: function(tree) {

        Planche.selectedTree = tree;
    },

    setSelectedNode: function(node) {

        Planche.selectedNode = node;
    },

    getSelectedNode: function() {

        return Planche.selectedNode;
    },

    getParentNode: function(n, depth, return_node) {

        if (!n) return null;
        if (typeof depth == "undefined") { depth = 1; }
        if (!n.parentNode) { return null; }
        if (n.data.depth != depth) {

            while (n.parentNode && n.parentNode.data.depth >= depth) {

                n = n.parentNode;
            }
        }

        if (return_node) {

            return n;
        }
        else {

            return n.data.text;
        }
    },

    reloadTree: function() {

        var tree = this.getSelectedTree(),
            node = this.getSelectedNode();

        tree.fireEvent('reloadTree', node);
    },

    checkToolbar: function() {

        var cnt = this.getConnectTabPanel().items.getCount();

        Ext.Array.each(this.getToolBar().items.getRange(1), function(obj, idx) {

            obj[cnt > 0 ? 'enable' : 'disable']();
        });
    },

    /**
     * openWindow
     *
     * Open new window in planche
     *
     * @access public
     *
     * @return
     */
    openWindow: function(id) {

        var args = Ext.toArray(arguments),
            ctrl = this.getController(id),
            cmp = Ext.getCmp('window-' + id);

        args.shift();

        if (cmp) {

            cmp.show();
        }
        else {

            ctrl.initWindow.apply(ctrl, args);
        }
    },

    initConnectTab: function(connInfo) {

        var
            main = this.getConnectTabPanel(),
            tab = Ext.create('Planche.view.layout.ConnectTab', Ext.Object.merge({
                title: connInfo.hostName
            }, connInfo));

        main.add(tab);
        main.setActiveTab(tab);

        return tab;
    },

    /**
     * initKeyMap
     *
     * initialize key map contents
     *
     * @access public
     *
     * @return
     */
    initKeyMap: function() {

        // map multiple keys to multiple actions by strings and array of codes
        var map = new Ext.util.KeyMap({
            target : Ext.getBody(),
            binding: [{
                scope: this,
                key  : Ext.EventObject.F9,
                fn   : function() {

                    this.executeQuery();
                }
            }, {
                scope: this,
                key  : Ext.EventObject.T,
                alt  : true,
                fn   : function(keyCode, e) {

                    this.openQueryTab();
                }
            }, {
                scope: this,
                key  : Ext.EventObject.N,
                alt  : true,
                fn   : function(keyCode, e) {

                    this.openConnPanel();
                }
            }, {
                scope: this,
                key  : Ext.EventObject.F,
                alt  : true,
                fn   : function(keyCode, e) {

                    this.openFindPanel();
                }
            }, {
                scope: this,
                key  : Ext.EventObject.P,
                alt  : true,
                fn   : function(keyCode, e) {

                    this.openQuickPanel();
                }
            }, {
                scope: this,
                key  : Ext.EventObject.U,
                alt  : true,
                fn   : function(keyCode, e) {

                    this.openUserPanel();
                }
            }, {
                scope: this,
                key  : Ext.EventObject.ESC,
                fn   : function(keyCode, e) {

                    var cmp = Ext.getCmp('window-quick');
                    if (!cmp) { return; }
                    cmp.destroy();
                }
            }]
        });
    },

    pushHistory: function(t, q) {

        this.history.push('/* ' + Ext.Date.format(new Date(), 'Y-m-d h:i:s') + ' 0ms */ ' + q.replace(/[\t\n]+/gi, " "));

        try {

            var editor = this.getActiveHistoryTab();
            editor.setValue(this.history.join("\n"));
        }
        catch (e) {

        }
    },

    /**
     * execute query
     *
     * @method tunneling
     * @param {String} config
     */
    tunneling: function(config) {

        var tab = this.getActiveConnectTab(),
            app = this;

        if (tab) {

            Ext.applyIf(config, {
                host        : tab.getHost(),
                user        : tab.getUser(),
                pass        : tab.getPass(),
                charset     : tab.getCharset(),
                port        : tab.getPort(),
                tunnelingURL: tab.getTunnelingURL(),
                requestType : tab.getRequestType()
            });
        }

        Ext.applyIf(config, {
            db          : '',
            query       : '',
            type        : 'query',
            async       : true,
            timeout     : 1000 * 60 * 5,
            host        : '',
            user        : '',
            pass        : '',
            charset     : 'utf8',
            port        : 3306,
            tunnelingURL: '',
            requestType : 'jsonp',
            success     : function(config, response) {

                var msg = response.affected_rows + ' row(s) affected<br>';
                msg += 'Execution Time : 00:00:00:000<br>';
                msg += 'Transfer Time  : 00:00:00:000<br>';
                msg += 'Total Time     : 00:00:00:000';
                this.openMessage(msg);
            },
            failure     : function(config, response) {

                this.openMessage(this.generateQueryErrorMsg(config.query, response.message));
            }
        });

        var reqConfig = {
            url    : config.tunnelingURL,
            async  : config.async,
            params : {
                db     : config.db,
                host   : config.host,
                user   : config.user,
                pass   : config.pass,
                charset: config.charset,
                port   : config.port,
                query  : config.query,
                type   : config.type
            },
            timeout: config.timeout,
            success: function(response) {

                //var response = Ext.JSON.decode(response.responseText);

                if (response.success == true) {

                    var t = '';
                    app.pushHistory(t, config.query);
                    config.success.apply(app, [config, response]);
                }
                else {

                    config.failure.apply(app, [config, response]);
                }
            },
            failure: function(response) {

                if (response == 'error') {

                    response = {
                        success: false,
                        message: 'Can\'t connect to MySQL Server'
                    }
                }

                if (response == 'timeout') {

                    response = {
                        success: false,
                        message: 'Can\'t connect to MySQL Server'
                    }
                }

                config.failure.apply(app, [config, response]);
            }
        };

        var reqType = window.location.protocol == 'file:' ? 'jsonp' : config.requestType;

        if (!config.host || !config.user || !config.pass) {

            reqConfig.failure({
                success: false,
                message: 'User connection information is incorrect'
            });

            return;
        }

        if (!config.tunnelingURL) {

            reqConfig.failure({
                success: false,
                message: 'Tunneling URL is incorrect'
            });

            return;
        }

        if (reqType == 'jsonp') {

            Ext.apply(reqConfig, {
                callbackKey: 'callback'
            });

            Ext.data.JsonP.request(reqConfig);
        }
        else {

            Ext.Ajax.request(reqConfig);
        }
    },

    /**
     * execute mulitple queries and run user callbacks
     *
     * @method multipleTunneling
     * @param {String} db database name
     * @param {Object} queries to be executed
     * @param {Object} callbacks callback functions object
     * @param {Object} scope scope
     */
    multipleTunneling: function(db, queries, callbacks, scope) {

        if (typeof scope == 'undefined') {

            scope = this;
        }

        var app = this.getApplication(), tunneling, idx = 0, results = [];

        Ext.applyIf(callbacks, {
            prevAllQueries : function() {
            },
            prevQuery      : function() {
            },
            successQuery   : function() {
            },
            failureQuery   : function() {
            },
            afterQuery     : function() {
            },
            afterAllQueries: function() {
            }
        });

        var execQueries = [];

        callbacks['prevAllQueries'].apply(scope, [queries]);

        (tunneling = function() {

            var query = queries.shift();

            if (query) {

                execQueries.push(query);

                callbacks['prevQuery'].apply(scope, [idx, query]);

                app.tunneling({
                    db     : db,
                    query  : query,
                    success: function(config, response) {

                        callbacks['successQuery'].apply(scope, [idx, query, config, response]);

                        results.push({
                            config  : config,
                            response: response
                        });

                        tunneling();
                    },
                    failure: function(config, response) {

                        callbacks['failureQuery'].apply(scope, [idx, query, config, response]);

                        results.push({
                            config  : config,
                            response: response
                        });

                        tunneling();
                    }
                });

                callbacks['afterQuery'].apply(scope, [idx, query]);

                idx++;
            }
            else {

                //complete all query
                callbacks['afterAllQueries'].apply(scope, [execQueries, results]);
            }
        })();
    },

    pasteSQLStatement: function(mode, node) {

        var db = this.getParentNode(node),
            table = node.data.text,
            a = [], b = [],
            api = this.getAPIS();

        var func = {
            'insert': Ext.Function.bind(function(records) {

                Ext.Array.each(records, function(row, idx) {

                    a.push("`" + row[0] + "`");
                    b.push("'" + row[0] + "'");
                });
                return api.getQuery('INSERT_TABLE', db, table, a.join(','), b.join(','));
            }, this),
            'update': Ext.Function.bind(function(records) {

                Ext.Array.each(records, function(row, idx) {

                    a.push("`" + row[0] + "`='" + row[0] + "'");
                    if (row[3] == "PRI") { b.push("`" + row[0] + "`='" + row[0] + "'"); }
                });
                return api.getQuery('UPDATE_TABLE', db, table, a.join(',\n'), b.join(' AND '));
            }, this),
            'delete': Ext.Function.bind(function(records) {

                Ext.Array.each(records, function(row, idx) {

                    if (row[3] == "PRI") { a.push("`" + row[0] + "`='" + row[0] + "'"); }
                });
                return api.getQuery('DELETE_TABLE', db, table, a.join(' AND '));
            }, this),
            'select': Ext.Function.bind(function(records) {

                Ext.Array.each(records, function(row, idx) {

                    a.push("`" + row[0] + "`");
                });
                return api.getQuery('SELECT_TABLE', db, table, a.join(', '));
            }, this)
        };

        this.tunneling({
            db     : db,
            query  : 'DESCRIBE `' + db + '`.`' + table + '`',
            success: function(config, response) {

                query = this.alignmentQuery(func[mode](response.records));
                this.setActiveEditorValue(query);
            }
        });
    },

    changeTableToType: function(engine) {

        var node = this.getSelectedNode();
        var db = this.getParentNode(node);
        var table = node.data.text;

        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('CHANGE_TABLE_TYPE', db, table, engine),
            success: function(config, response) {

                this.openMessage('Table engine changed to ' + engine);
            }
        });
    },

    createView: function() {

        var node = this.getSelectedNode();
        var db = this.getParentNode(node);
        Ext.Msg.prompt('Create View', 'Please enter new view name:', function(btn, text) {

            if (btn == 'ok') {

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_VIEW', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterView: function() {

        var node = this.getSelectedNode(),
            db = this.getParentNode(node),
            name = node.getData().text;

        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_CREATE_VIEW', db, name),
            node   : node,
            success: function(config, response) {

                this.openQueryTab();

                var body = this.getAPIS().getQuery('ALTER_VIEW', db, name, response.records[0][1]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    createProcedure: function() {

        var node = this.getSelectedNode(),
            db = this.getParentNode(node);
        Ext.Msg.prompt('Create Procedure', 'Please enter new procedure name:', function(btn, name) {

            if (btn == 'ok') {

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_PROCEDURE', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterProcedure: function() {

        var node = this.getSelectedNode(),
            db = this.getParentNode(node),
            name = node.getData().text;
        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_CREATE_PROCEDURE', db, name),
            node   : node,
            success: function(config, response) {

                if (response.records.length == 0) {

                    return;
                }

                if (!response.records[0][2]) {

                    Ext.Msg.alert('error', 'Unable to retrieve information. Please check your permission.');
                    return;
                }

                this.openQueryTab();

                var body = this.getAPIS().getQuery('ALTER_PROCEDURE', db, name, response.records[0][2]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    createFunction: function() {

        var node = this.getSelectedNode(),
            db = this.getParentNode(node);
        Ext.Msg.prompt('Create Function', 'Please enter new function name:', function(btn, name) {

            if (btn == 'ok') {

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_FUNCTION', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterFunction: function() {

        var node = this.getSelectedNode(),
            db = this.getParentNode(node),
            name = node.getData().text;
        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_CREATE_FUNCTION', db, name),
            node   : node,
            success: function(config, response) {

                if (response.records.length == 0) {

                    return;
                }

                if (!response.records[0][2]) {

                    Ext.Msg.alert('error', 'Unable to retrieve information. Please check your permission.');
                    return;
                }

                this.openQueryTab();

                var body = this.getAPIS().getQuery('ALTER_FUNCTION', db, name, response.records[0][2]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    createTrigger: function() {

        var node = this.getSelectedNode(),
            db = this.getParentNode(node);
        Ext.Msg.prompt('Create Trigger', 'Please enter new trigger name:', function(btn, name) {

            if (btn == 'ok') {

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_TRIGGER', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterTrigger: function() {

        var node = this.getSelectedNode(),
            db = this.getParentNode(node),
            name = node.getData().text.match(/.+?\b/)[0];
        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_CREATE_TRIGGER', db, name),
            node   : node,
            success: function(config, response) {

                this.openQueryTab();

                var body = this.getAPIS().getQuery('ALTER_TRIGGER', db, name, response.records[0][2]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    createEvent: function() {

        var node = this.getSelectedNode();
        var db = this.getParentNode(node);
        Ext.Msg.prompt('Create Event', 'Please enter new event name:', function(btn, name) {

            if (btn == 'ok') {

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_EVENT', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterEvent: function() {

        var node = this.getSelectedNode(),
            db = this.getParentNode(node),
            name = node.getData().text;
        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_CREATE_EVENT', db, name),
            node   : node,
            success: function(config, response) {

                this.openQueryTab();

                var body = this.getAPIS().getQuery('ALTER_EVENT', db, name, response.records[0][3]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },


    openConnPanel: function() {

        this.openWindow('connection.Connect');
    },

    openFindPanel: function() {

        this.openWindow('command.Find');
    },

    openUserPanel: function() {

        this.openWindow('user.Grant');
    },

    openTokenPanel: function(tokens) {

        this.openWindow('query.Token', tokens);
    },

    openProcessPanel: function() {

        this.openWindow('command.Process');
    },

    openFlushPanel: function() {

        this.openWindow('command.Flush');
    },

    openStatusPanel: function() {

        this.openWindow('command.Status');
    },

    openFlushPanel: function() {

        this.openWindow('command.Flush');
    },

    openVariablesPanel: function() {

        this.openWindow('command.Variables');
    },

    openQuickPanel: function(records) {

        var db = this.getParentNode(this.getSelectedNode());
        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_ALL_TABLE_STATUS', db),
            success: function(config, response) {

                this.openWindow('command.Quick', response);
            }
        });
    },

    openAlterTableWindow: function(node) {

        var db = this.getParentNode(node);
        this.openWindow('table.EditSchemeWindow', db, node.data.text);
    },

    openCreateTableWindow: function() {

        var node = this.getSelectedNode(),
            db = this.getParentNode(node);

        this.openWindow('table.EditSchemeWindow', db);
    },

    openCreateDatabaseWindow: function(node) {

        this.openWindow('database.CreateDatabase', node);
    },

    openReorderColumns: function(node) {

        var db = this.getParentNode(node);
        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_FULL_FIELDS', db, node.data.text),
            success: function(config, response) {

                this.openWindow('table.ReorderColumns', db, node.data.text, response);
            }
        });
    },

    openAdvancedProperties: function(node) {

        var db = this.getParentNode(node);
        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_ADVANCED_PROPERTIES', db, node.data.text),
            success: function(config, response) {

                this.openWindow('table.AdvancedProperties', db, node.data.text, response);
            }
        });
    },

    openQueryTab: function() {

        this.initQueryTab('Query');
    },

    initQueryTab: function(name, closable) {

        this.getQueryTabPanel().fireEvent('initQueryTab', name, closable);
    },

    createDatabase: function() {

        this.openCreateDatabaseWindow();
    },

    alterDatabase: function(node) {

        this.openCreateDatabaseWindow(node);
    },

    dropDatabase: function(node) {

        var db = node.data.text;
        Ext.Msg.confirm('Drop Database \'' + db + '\'', 'Do you really want to drop the database?\n\nWarning: You will lose all data!', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('DROP_DATABASE', db),
                    success: function(config, response) {

                        this.getSelectedTree().getSelectionModel().select(node.parentNode);
                        node.remove();
                    }
                });
            }
        }, this);
    },

    truncateDatabase: function(node) {

        var db = node.data.text,
            app = this;

        Ext.Msg.confirm('Truncate Database \'' + db + '\'', 'Do you really want to truncate the database?\n\nWarning: You will lose all data!', function(btn, text) {

            if (btn == 'yes') {

                var queries = [], messages = [];

                app.tunneling({
                    db     : db,
                    query  : app.getAPIS().getQuery('SHOW_DATABASE_TABLES', db),
                    success: function(config, response) {

                        Ext.Array.each(response.records, function(row, idx) {

                            var table = row[0];
                            queries.push(app.getAPIS().getQuery('DROP_TABLE', db, table));
                        });

                        this.multipleTunneling(db, queries, {
                            prevAllQueries : function(queries) {

                                app.getActiveConnectTab().setLoading(true);
                            },
                            failureQuery   : function(idx, query, config, response) {

                                messages.push(app.generateQueryErrorMsg(query, response.message));
                            },
                            afterAllQueries: function(queries, results) {

                                app.getActiveConnectTab().setLoading(false);

                                if (messages.length > 0) {

                                    app.openMessage(messages);
                                }
                                else {

                                    Ext.Array.each(node.childNodes, function(childNode, idx) {

                                        childNode.removeAll();
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }, this);
    },

    emptyDatabase: function(node) {

        var db = node.data.text;
        Ext.Msg.confirm('Empty Database \'' + db + '\'', 'Do you really want to empty the database?\n\nWarning: You will lose all data!', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : 'EMPTY DATABASE `' + db + '`',
                    success: function(config, response) {


                    }
                });
            }
        }, this);
    },

    renameTable: function(node) {

        var db = this.getParentNode(node);
        var table = node.data.text;
        Ext.Msg.prompt('Rename Table \'' + table + '\' in \'' + db + '\'', 'Please enter new table name:', function(btn, text) {

            if (btn == 'ok') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('RENAME_TABLE', db, table, db, text),
                    success: function(config, response) {

                        node.set('text', text);
                    }
                });
            }
        }, this, false, table);
    },

    truncateTable: function(node) {

        var db = this.getParentNode(node);
        var table = node.data.text;
        Ext.Msg.confirm('Truncate Table \'' + table + '\' in \'' + db + '\'', 'Do you really want to truncate the table?\n\nWarning: You will lose all data!', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('TRUNCATE_TABLE', db, table),
                    success: function(config, response) {

                        this.openTable(node);
                    }
                });
            }
        }, this);
    },

    dropTable: function(node) {

        var db = this.getParentNode(node);
        var table = node.data.text;
        Ext.Msg.confirm('Drop Table \'' + table + '\' in \'' + db + '\'', 'Do you really want to drop the table?\n\nWarning: You will lose all data!', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : 'DROP TABLE `' + db + '`.`' + table + '`',
                    success: function(config, response) {

                        this.getSelectedTree().getSelectionModel().select(node.parentNode);
                        node.remove();
                    }
                });
            }
        }, this);
    },


    setActiveEditorValue: function(v) {

        var editor = this.getActiveEditor();
        t = editor.getValue();
        editor.setValue(t ? t + "\n" + v : v);
    },


    parseQuery: function(query) {

        var parser = Ext.create('Planche.lib.QueryParser', this.getAPIS()),
            queries = parser.parse(query);

        return queries;
    },

    alignmentQuery: function(query) {

        if (typeof query == 'string') {

            var queries = this.parseQuery(query);

            if (queries.length == 0) {

                return query;
            }

            var tmp = [];
            Ext.Array.each(queries, function(query, idx) {

                tmp.push(Planche.lib.QueryAlignment.alignment(query));
            });

            tmp = tmp.join('\n');

            return tmp;
        }

        return Planche.lib.QueryAlignment.alignment(query);
    },

    formatQuery: function(query) {

        if (query) {

            var queries = query;
        }
        else {

            var editor = this.getActiveEditor();

            if (!editor) { return; }

            if (editor.somethingSelected()) {

                var queries = editor.getSelection();
            }
            else {

                var queries = editor.getValue();
            }
        }

        var parser = Ext.create('Planche.lib.QueryParser', this.getAPIS());
        queries = parser.parse(queries);

        if (queries.length == 0) {

            return;
        }

        var tmp = [];
        Ext.Array.each(queries, function(query, idx) {

            tmp.push(Planche.lib.QueryAlignment.alignment(query));
        });

        tmp = tmp.join('\n\n');

        if (query) {

            return tmp;
        }
        else {

            if (editor.somethingSelected()) {

                editor.replaceSelection(tmp);
            }
            else {

                editor.setValue(tmp);
            }
        }
    },

    /**
     * executeQuery
     *
     * 선택된 쿼리를 재귀적으로 실행한다.
     *
     * @access public
     *
     * @return
     */
    executeQuery: function() {

        var queries = this.getParsedQuery();

        if (queries.length == 0) {

            this.openMessage(this.generateError(
                'Query was empty',
                'No query(s) were executed. Please enter a query in the SQL editor or place the cursor inside a query.'
            ));

            return;
        }

        this.removeResultTabPanel();

        var panel = this.getActiveMessageTab(),
            dom = Ext.get(panel.getEl().query("div[id$=innerCt]")),
            node = this.getSelectedNode(),
            db = this.getParentNode(node);

        dom.setHTML('');

        var tunneling;
        var messages = [];
        (tunneling = Ext.Function.bind(function() {

            var query = queries.shift();

            if (query) {

                if (query.isDelimiter() == true) {

                    messages.push(this.generateQuerySuccessMsg(
                        query.raw,
                        'Change Delimiter'
                    ));

                    tunneling();
                    return;
                }

                this.getActiveConnectTab().setLoading(true);

                this.tunneling({
                    db     : db,
                    query  : query.getSQL(),
                    success: function(config, response) {

                        if (response.is_result_query == true) {

                            this.initQueryResult({
                                icon    : 'resources/images/icon_table.png',
                                closable: true,
                                title   : 'Result'
                            }, db, query, response);
                        }
                        else {

                            var msg = response.affected_rows + ' row(s) affected<br/><br/>';
                            msg += 'Execution Time : ' + response.exec_time + '<br/>';
                            msg += 'Transfer Time  : ' + response.transfer_time + '<br/>';
                            msg += 'Total Time     : ' + response.total_time;
                            messages.push(query.getSQL() + '<br/><br/>' + msg);
                        }

                        this.getActiveConnectTab().setLoading(false);

                        tunneling();
                    },
                    failure: function(config, response) {

                        messages.push(this.generateError(query.getSQL(), response.message));

                        this.getActiveConnectTab().setLoading(false);

                        tunneling();
                    }
                })
            }
            else {

                this.afterExecuteQuery(messages);
                this.reloadTree();
            }

        }, this))();
    },

    afterExecuteQuery: function(messages) {

        if (messages.length == 0) { return; }

        this.openMessage(messages);
    },

    /**
     * Trigger openMessage event with  some messages
     *
     * @access public
     * @method getToolBar
     */
    openMessage: function(messages) {

        this.getActiveMessageTab().fireEvent('openMessage', messages);
    },

    generateQueryErrorMsg: function(query, message) {

        return this.generateError('The Query : ' + query, message);
    },

    generateQuerySuccessMsg: function(query, message) {

        return this.generateSuccessMsg('The Query : ' + query, message);
    },

    generateSuccessMsg: function(title, message) {

        message = message || "";
        return '<div class="query_success">' + title + '<span class="message"> ' + message + '</span></div>';
    },

    generateError: function(title, message) {

        message = message || "";
        return '<div class="query_err">' + title + '<span class="message"> ' + message + '</span></div>';
    },

    getParsedQuery: function() {

        var queries = [];

        var editor = this.getActiveEditor();

        if (!editor) { return queries; }

        var parser = Ext.create('Planche.lib.QueryParser', this.getAPIS());

        if (editor.somethingSelected()) {

            return parser.parse(editor.getSelection());
        }
        else {

            var cursor = editor.getCursor();

            queries = parser.parse(editor.getValue());
            var tmp = [];
            Ext.Array.each(queries, function(query, idx) {

                if (tmp.length > 0) return;

                if (cursor.line == query.eline[0] && cursor.ch <= query.eline[1]) {

                    tmp.push(query);
                }
                else if (cursor.line < query.eline[0]) {

                    tmp.push(query);
                }
            });
            return tmp;
        }
    },

    openTable: function(node) {

        var
            tab = this.getActiveTableDataTab(),
            db = this.getParentNode(node),
            parser = Ext.create('Planche.lib.QueryParser', this.getAPIS()),
            queries = parser.parse(this.getAPIS().getQuery('OPEN_TABLE', db, node.data.text)),
            query = queries[0];

        this.tunneling({
            db     : db,
            query  : query.getSQL(),
            node   : node,
            tab    : tab,
            success: function(config, response) {

                this.initQueryResult({openTable: node.data.text}, db, query, response);
            }
        });
    },

    makeRecords: function(fields, records) {

        var tmp = [];
        Ext.Array.each(records, function(row, ridx) {

            var record = {};
            Ext.Array.each(fields, function(col, cidx) {

                record[col.name] = row[cidx];
            });
            tmp.push(record);
        });

        return tmp;
    },

    initQueryResult: function(config, db, query, response) {

        this.getActiveResultTabPanel().fireEvent('initQueryResult', config, db, query, response);
    },

    showMessage: function(msg) {

        Ext.Msg.alert('Message', msg);
    },

    getAssocArray: function(fields, records, upper_case_key) {

        upper_case_key = upper_case_key || false;

        if (upper_case_key) {

            Ext.Array.each(fields, function(field, fidx) {

                fields[fidx].name = field.name.toUpperCase();
            });
        }

        var tmp = [];
        Ext.Array.each(records, function(record, ridx) {

            var row = {};
            Ext.Array.each(fields, function(field, fidx) {

                row[field.name] = record[fidx];
            });

            tmp.push(row);
        });

        return tmp;
    },

    tokenize: function() {

        var editor = this.getActiveEditor();

        if (!editor) { return; }
        if (!editor.somethingSelected()) {

            this.showMessage('Query is not selected.');
            return;
        }

        var queries = editor.getSelection(),
            queries = this.parseQuery(queries);

        var tokens = [];
        Ext.Array.each(queries, function(query, idx) {

            Ext.Array.each(query.getTokens(), function(token, idx) {

                tokens.push(token);
            });
        });

        this.openTokenPanel(tokens);
    }
});
