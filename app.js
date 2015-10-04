Ext.application({
    name: 'Planche',

    extend            : 'Planche.Application',
    history           : [],
    taskQueue         : [],
    onTask            : false,
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

        var app = this;
        app.initKeyMap();

        Ext.Array.each(app.getHosts(), function(host, idx) {

            if (host.autoConnection) {

                app.initConnectTab(host);
            }
        });

        app.loadTask();

        if (Planche.config.autoLoadConnectionWindow) {

            app.openConnPanel();
        }
    },

    /**
     /**
     * Return context menu component of schema tree in left side bar
     *
     * @access public
     * @method getSchemaContextMenu
     */
    getSchemaContextMenu: function() {

        return Ext.getCmp('schema-context-menu');
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
     * Return active connected tab's quick command list
     *
     * @access public
     * @method getActiveQuickCommands
     */
    getActiveQuickCommands: function() {

        return this.getActiveConnectTab().quickCommand.get();
    },

    /**
     * Return footer task progress bar
     *
     * @access public
     * @method getTaskProgressBar
     */
    getTaskProgressBar: function() {

        return Ext.getCmp('footer-task-progressbar');
    },

    updateTaskProgressBar: function(val) {

        var per = Math.ceil(val * 100);

        this.getTaskProgressBar().updateProgress(val, per + '% (Remaining ' + this.getTaskQueue().length + ' task(s))');
    },

    addTask: function(task, params) {

        this.getTaskQueue().push([task, params]);
    },

    getTaskQueue: function() {

        return this.taskQueue;
    },

    getTask: function() {

        return this.getTaskQueue().shift();
    },

    loadTask: function() {

        var app = this,
            run;

        (run = function() {
            setTimeout(function() {

                if (app.onTask) {

                    run();
                    return;
                }

                var task = app.getTask();

                if (task) {

                    task[0].apply(app, task[1]);
                }

                run();

            }, 1000);
        })();

    },

    /**
     * Return footer task message
     *
     * @access public
     * @method getTaskMessage
     */
    getTaskMessage: function() {

        var el;

        if (el) {

            return el;
        }

        el = Ext.get('footer-task-message').el;
        return el;
    },

    /**
     * update task message
     *
     * @access public
     * @method updateTaskMessage
     */
    updateTaskMessage: function(text) {

        this.getTaskMessage().update(text);
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

    /**
     * Return query editor's selected sql in active query tab
     *
     * @access public
     * @method getActiveEditorSelection
     */
    getActiveEditorSelection: function() {

        try {

            var editor = this.getActiveEditor();
            if (editor.somethingSelected()) {

                return editor.getSelection();
            }
            else {

                return "";
            }
        }
        catch (e) {

            return "";
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

    getSelectedNode: function(return_node) {

        if (return_node) {

            return Planche.selectedNode;
        }

        return Planche.selectedNode.data.text;
    },

    getSelectedNodeType: function() {

        if (!Planche.selectedNode) {

            return null;
        }

        return Planche.selectedNode.raw.type;
    },

    getSelectedDatabase: function(return_node) {

        var node = this.getSelectedNode(true);
        return this.getParentNode(node, 'database', return_node);
    },

    getSelectedTable: function(return_node) {

        var node = this.getSelectedNode(true);
        return this.getParentNode(node, 'table', return_node);
    },

    getParentNode: function(n, depth_or_type, return_node) {

        if (typeof depth_or_type == "undefined") {

            depth_or_type = 'database';
        }

        if (!n) {

            return null;
        }

        var node = null;

        if (typeof depth_or_type == 'string') {

            while (n) {

                if (n.raw.type == depth_or_type) {

                    node = n;
                    break;
                }

                n = n.parentNode;
            }
        }
        else {

            if (n.data.depth < depth_or_type) {

                return null;
            }

            while (n) {

                if (n.data.depth == depth_or_type) {

                    node = n;
                    break;
                }

                n = n.parentNode;
            }
        }

        if (!node) {

            return null;
        }

        if (return_node) {

            return node;
        }
        else {

            return node.data.text;
        }
    },

    getHostsInStorage: function() {

        var hosts = localStorage.getItem('planche-hosts');

        try {

            hosts = Ext.JSON.decode(hosts) || [];
        }
        catch (e) {

            hosts = [];
        }

        return hosts;
    },

    getHosts: function() {

        var hosts = [],
            hostIdx = 0;

        Ext.Array.each(Planche.config.hosts, function(connInfo, index) {

            Ext.apply(connInfo, {
                'into' : 'hostfile',
                'index': index
            });

            hosts.push(connInfo);
        });

        if (typeof(Storage) !== "undefined") {

            try {

                var savedLocalHosts = JSON.parse(localStorage.getItem('planche-hosts'));
            }
            catch (e) {

                var savedLocalHosts = [];
            }

            Ext.Array.each(savedLocalHosts, function(connInfo, index) {

                Ext.apply(connInfo, {
                    'into' : 'localstorage',
                    'index': index
                });

                hosts.push(connInfo);
            });
        }

        return hosts;
    },

    setHostsInStorage: function(hosts) {

        localStorage.setItem('planche-hosts', Ext.JSON.encode(hosts));

        this.fireEvent('initHosts');
    },

    reloadTree: function() {

        var tree = this.getSelectedTree(),
            node = this.getSelectedNode(true);

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

        var main = this.getConnectTabPanel(),
            tab = Ext.create('Planche.view.layout.ConnectTab', Ext.Object.merge({
                title       : connInfo.hostName,
                quickCommand: Ext.create('Planche.lib.QuickCommand')
            }, connInfo));

        main.add(tab);
        main.setActiveTab(tab);

        this.addTask(this.loadQuickCommands, [tab]);
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
                fn   : function(keyCode, e) {

                    e.stopEvent();
                    this.executeQuery();
                }
            }, {
                scope: this,
                key  : Ext.EventObject.T,
                alt  : true,
                fn   : function(keyCode, e) {

                    e.stopEvent();
                    this.openQueryTab();
                }
            }, {
                scope: this,
                key  : Ext.EventObject.N,
                alt  : true,
                fn   : function(keyCode, e) {

                    e.stopEvent();
                    this.openConnPanel();
                }
            }, {
                scope: this,
                key  : [
                    Ext.EventObject.P,
                    Ext.EventObject.O
                ],
                ctrl : true,
                fn   : function(keyCode, e) {

                    e.stopEvent();
                    this.openQuickPanel();
                }
            }, {
                scope: this,
                key  : [
                    Ext.EventObject.P,
                    Ext.EventObject.O
                ],
                alt  : true,
                fn   : function(keyCode, e) {

                    e.stopEvent();
                    this.openQuickPanel();
                }
            }, {
                scope: this,
                key  : Ext.EventObject.U,
                alt  : true,
                fn   : function(keyCode, e) {

                    e.stopEvent();
                    this.openUserPanel();
                }
            }]
        });
    },

    pushHistory: function(t, q) {

        q = Ext.String.trim(q);
        this.history.push('/* ' + Ext.Date.format(new Date(), 'Y-m-d h:i:s') + ' ' + t.toFixed(4) + ' Sec */ ' + q.replace(/[\t\n]+/gi, " "));

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

        Ext.Ajax.cors = true;
        Ext.Ajax.useDefaultXhrHeader = false;

        var connection = config.connection || this.getActiveConnectTab(),
            app = this;

        Ext.applyIf(config, {
            type       : 'query',
            async      : true,
            timeout    : 1000 * 60 * 5,
            charset    : 'utf8',
            port       : 3306,
            requestType: 'jsonp',
            method     : 'post',
            success    : function(config, response) {

                var msg = response.affected_rows + ' row(s) affected<br>';
                msg += 'Execution Time : 00:00:00:000<br>';
                msg += 'Transfer Time  : 00:00:00:000<br>';
                msg += 'Total Time     : 00:00:00:000';
                this.openMessage(msg);
            },
            failure    : function(config, response) {

                this.openMessage(this.generateQueryErrorMsg(config.query, response.message));
            }
        });

        if (connection) {

            Ext.applyIf(config, {
                hostName    : connection.getHostName(),
                host        : connection.getHost(),
                user        : connection.getUser(),
                pass        : connection.getPass(),
                charset     : connection.getCharset(),
                port        : connection.getPort(),
                tunnelingURL: connection.getTunnelingURL(),
                requestType : connection.getRequestType()
            });
        }

        var params = Planche.Base64.encode(Ext.JSON.encode({
            db     : config.db,
            host   : config.host,
            user   : config.user,
            pass   : config.pass,
            charset: config.charset,
            port   : config.port,
            query  : config.query,
            type   : config.type
        }));

        var reqConfig = {
            url    : config.tunnelingURL,
            async  : config.async,
            params : {
                cmd: params
            },
            timeout: config.timeout,
            success: function(response) {

                if (response.responseText) {

                    response = Ext.JSON.decode(response.responseText);
                }

                if (response.success == true) {

                    if (config.type == 'query') {

                        app.pushHistory(response.exec_time, config.query);
                    }

                    config.success.apply(app, [config, response]);
                }
                else {

                    config.failure.apply(app, [config, response]);
                }
            },
            failure: function(response) {

                if (response.status === 0) {

                    response = {
                        success: false,
                        message: 'Network error : Can\'t connect to tunneling URL'
                    }
                }

                if (response.responseText) {

                    response = Ext.JSON.decode(response.responseText);
                }

                if (response == 'error') {

                    response = {
                        success: false,
                        message: 'Network error : Can\'t connect to tunneling URL'
                    }
                }

                if (response == 'timeout') {

                    response = {
                        success: false,
                        message: 'Can\'t connect to MySQL Server'
                    }
                }

                if (response == 'abort') {

                    response = {
                        success: false,
                        message: 'This operation was aborted'
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
     * @method tunnelings
     * @param {String} db database name
     * @param {Object} queries to be executed
     * @param {Object} callbacks callback functions object
     * @param {Object} scope scope
     */
    tunnelings: function(db, queries, callbacks, scope) {

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

        var execQueries = [],
            config = {};

        callbacks['prevAllQueries'].apply(scope, [queries]);

        (tunneling = function() {

            var query = queries.shift();

            if (query) {

                execQueries.push(query);

                callbacks['prevQuery'].apply(scope, [idx, query]);

                var config = {
                    db     : db,
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
                };

                if (typeof query == 'object') {

                    Ext.apply(config, query);
                }
                else {

                    Ext.apply(config, {
                        query: query
                    });
                }

                app.tunneling(config);

                callbacks['afterQuery'].apply(scope, [idx, query]);

                idx++;
            }
            else {

                //complete all query
                callbacks['afterAllQueries'].apply(scope, [execQueries, results]);
            }
        })();
    },

    pasteSQLStatement: function(db, table, mode) {

        var a = [], b = [], c = [],
            api = this.getAPIS(),
            func = {
                'insert'          : function(records) {

                    Ext.Array.each(records, function(row) {

                        a.push("`" + row[0] + "`");
                        b.push("'" + row[0] + "'");
                    });
                    return api.getQuery('INSERT_TABLE', db, table, a.join(','), b.join(','));
                },
                'duplicate_update': function(records) {

                    Ext.Array.each(records, function(row) {

                        a.push("`" + row[0] + "`");
                        b.push("'" + row[0] + "'");
                        if (row[3] != "PRI") {

                            c.push("`" + row[0] + "`= VALUES(" + row[0] + ")");
                        }
                    });
                    return api.getQuery('INSERT_ON_DUPLICATE', db, table, a.join(','), b.join(','), c.join(','));
                },
                'update'          : function(records) {

                    Ext.Array.each(records, function(row) {

                        a.push("`" + row[0] + "`='" + row[0] + "'");
                        if (row[3] == "PRI") { b.push("`" + row[0] + "`='" + row[0] + "'"); }
                    });
                    return api.getQuery('UPDATE_TABLE', db, table, a.join(',\n'), b.join(' AND '));
                },
                'delete'          : function(records) {

                    Ext.Array.each(records, function(row) {

                        if (row[3] == "PRI") { a.push("`" + row[0] + "`='" + row[0] + "'"); }
                    });
                    return api.getQuery('DELETE_TABLE', db, table, a.join(' AND '));
                },
                'select'          : function(records) {

                    Ext.Array.each(records, function(row) {

                        a.push("`" + row[0] + "`");
                    });
                    return api.getQuery('SELECT_TABLE', db, table, a.join(', '), '');
                }
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

    changeTableToType: function(db, table, engine) {

        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('CHANGE_TABLE_TYPE', db, table, engine),
            success: function(config, response) {

                this.openMessage(this.generateQuerySuccessMsg(config.query, 'Table engine changed to ' + engine));
            }
        });
    },

    createView: function(db) {

        Ext.Msg.prompt('Create View', 'Please enter new view name:', function(btn, name) {

            if (btn == 'ok') {

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_VIEW', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterView: function(db, view) {

        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_CREATE_VIEW', db, view),
            success: function(config, response) {

                this.openQueryTab();

                var body = this.getAPIS().getQuery('ALTER_VIEW', db, view, response.records[0][1]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    dropView: function(db, view, callback) {

        Ext.Msg.confirm('Drop View \'' + view + '\'', 'Do you really want to drop the view?', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('DROP_VIEW', db, view),
                    success: function(config, response) {

                        if (callback) {

                            callback(config, response);
                        }
                    }
                });
            }
        }, this);
    },

    renameView: function(db, view, callback) {

        var app = this;

        Ext.Msg.prompt('Rename View \'' + view + '\' in \'' + db + '\'', 'Please enter new view name:', function(btn, name) {

            if (btn == 'ok') {

                var queries = [],
                    messages = [];
                this.tunneling({
                    db     : db,
                    query  : app.getAPIS().getQuery('SHOW_CREATE_VIEW', db, view),
                    success: function(config, response) {

                        var body = response.records[0][1];

                        queries.push(app.getAPIS().getQuery('DROP_VIEW', db, view));
                        queries.push(body.replace('`' + view + '`', '`' + name + '`'));

                        this.tunnelings(db, queries, {
                            failureQuery   : function(idx, query, config, response) {

                                messages.push(app.generateQueryErrorMsg(query, response.message));
                            },
                            afterAllQueries: function(queries, results) {

                                app.setLoading(false);

                                if (messages.length > 0) {

                                    app.openMessage(messages);
                                }
                                else {

                                    if (callback) {

                                        callback(queries, results);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        }, this);
    },

    createProcedure: function(db) {

        Ext.Msg.prompt('Create Procedure', 'Please enter new procedure name:', function(btn, name) {

            if (btn == 'ok') {

                this.openQueryTab();
                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_PROCEDURE', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterProcedure: function(db, procedure) {

        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_CREATE_PROCEDURE', db, procedure),
            success: function(config, response) {

                if (response.records.length == 0) {

                    return;
                }

                if (!response.records[0][2]) {

                    Ext.Msg.alert('error', 'Unable to retrieve information. Please check your permission.');
                    return;
                }

                this.openQueryTab();

                var body = this.getAPIS().getQuery('ALTER_PROCEDURE', db, procedure, response.records[0][2]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    dropProcedure: function(db, procedure, callback) {

        Ext.Msg.confirm('Drop Procedure \'' + proc + '\'', 'Do you really want to drop the procedure?', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('DROP_PROCEDURE', db, procedure),
                    success: function(config, response) {

                        if (callback) {

                            callback(config, response);
                        }
                    }
                });
            }
        }, this);
    },

    createFunction: function(db) {

        Ext.Msg.prompt('Create Function', 'Please enter new function name:', function(btn, name) {

            if (btn == 'ok') {

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_FUNCTION', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterFunction: function(db, func) {

        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_CREATE_FUNCTION', db, func),
            success: function(config, response) {

                if (response.records.length == 0) {

                    return;
                }

                if (!response.records[0][2]) {

                    Ext.Msg.alert('error', 'Unable to retrieve information. Please check your permission.');
                    return;
                }

                this.openQueryTab();

                var body = this.getAPIS().getQuery('ALTER_FUNCTION', db, func, response.records[0][2]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    dropFunction: function(db, func, callback) {

        Ext.Msg.confirm('Drop Function \'' + func + '\'', 'Do you really want to drop the function?', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('DROP_FUNCTION', db, func),
                    success: function(config, response) {

                        if (callback) {

                            callback(config, response);
                        }
                    }
                });
            }
        }, this);
    },

    createTrigger: function(db) {

        Ext.Msg.prompt('Create Trigger', 'Please enter new trigger name:', function(btn, name) {

            if (btn == 'ok') {

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_TRIGGER', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterTrigger: function(db, trigger) {

        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_CREATE_TRIGGER', db, trigger),
            success: function(config, response) {

                this.openQueryTab();

                var body = this.getAPIS().getQuery('ALTER_TRIGGER', db, trigger, response.records[0][2]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    dropTrigger: function(db, trigger, callback) {

        Ext.Msg.confirm('Drop Trigger \'' + trigger + '\'', 'Do you really want to drop the trigger?', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('DROP_TRIGGER', db, trigger),
                    success: function(config, response) {

                        if (callback) {

                            callback(config, response);
                        }
                    }
                });
            }
        }, this);
    },

    renameTrigger: function(db, trigger, callback) {

        var app = this;

        Ext.Msg.prompt('Rename Trigger \'' + trigger + '\' in \'' + db + '\'', 'Please enter new trigger name:', function(btn, name) {

            if (btn == 'ok') {

                var queries = [],
                    messages = [];
                this.tunneling({
                    db     : db,
                    query  : app.getAPIS().getQuery('SHOW_CREATE_TRIGGER', db, trigger),
                    success: function(config, response) {

                        var body = response.records[0][2];

                        queries.push(app.getAPIS().getQuery('DROP_TRIGGER', db, trigger));
                        queries.push(body.replace('`' + trigger + '`', '`' + name + '`'));

                        this.tunnelings(db, queries, {
                            failureQuery   : function(idx, query, config, response) {

                                messages.push(app.generateQueryErrorMsg(query, response.message));
                            },
                            afterAllQueries: function(queries, results) {

                                app.setLoading(false);

                                if (messages.length > 0) {

                                    app.openMessage(messages);
                                }
                                else {

                                    if (callback) {

                                        callback(config, response, name);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        }, this);
    },

    createEvent: function(db) {

        Ext.Msg.prompt('Create Event', 'Please enter new event name:', function(btn, name) {

            if (btn == 'ok') {

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_EVENT', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterEvent: function(db, event) {

        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_CREATE_EVENT', db, event),
            success: function(config, response) {

                this.openQueryTab();

                var body = this.getAPIS().getQuery('ALTER_EVENT', db, event, response.records[0][3]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    dropEvent: function(db, event, callback) {

        Ext.Msg.confirm('Drop Event \'' + event + '\'', 'Do you really want to drop the event?', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('DROP_EVENT', db, event),
                    success: function(config, response) {

                        if (callback) {

                            callback(config, response);
                        }
                    }
                });
            }
        }, this);
    },

    renameEvent: function(db, event, callback) {

        var app = this;

        Ext.Msg.prompt('Rename Event \'' + event + '\' in \'' + db + '\'', 'Please enter new event name:', function(btn, name) {

            if (btn == 'ok') {

                var queries = [],
                    messages = [];
                this.tunneling({
                    db     : db,
                    query  : app.getAPIS().getQuery('SHOW_CREATE_EVENT', db, event),
                    success: function(config, response) {

                        var body = response.records[0][3];

                        queries.push(app.getAPIS().getQuery('DROP_EVENT', db, event));
                        queries.push(body.replace('`' + event + '`', '`' + name + '`'));

                        this.tunnelings(db, queries, {
                            failureQuery   : function(idx, query, config, response) {

                                messages.push(app.generateQueryErrorMsg(query, response.message));
                            },
                            afterAllQueries: function(queries, results) {

                                app.setLoading(false);

                                if (messages.length > 0) {

                                    app.openMessage(messages);
                                }
                                else {

                                    if (callback) {

                                        callback(config, response, name);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        }, this);
    },

    openConnPanel: function() {

        this.openWindow('connection.Connect');
    },

    openFindPanel: function() {

        this.openWindow('command.Find');
    },

    openUserPanel: function() {

        this.tunneling({
            db     : 'mysql',
            query  : this.getAPIS().getQuery('SELECT_ALL_USER'),
            success: function() {

                this.openWindow('user.Grant');
            }
        });
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

    openQuickPanel: function() {

        this.openWindow('command.Quick');
    },

    openAlterTableWindow: function(db, table) {

        this.openWindow('table.EditSchemaWindow', db, table);
    },

    openCreateTableWindow: function(db) {

        this.openWindow('table.EditSchemaWindow', db);
    },

    openCreateDatabaseWindow: function(db) {

        this.openWindow('database.CreateDatabase', db);
    },

    openCopyDatabaseWindow: function(type, name) {

        this.openWindow('database.CopyDatabaseWindow', type, name);
    },

    openSchemaToHTMLWindow: function() {

        this.openWindow('database.SchemaToHTML');
    },

    openSchemaToCSVWindow: function() {

        this.openWindow('database.DownloadToCSV');
    },

    openReorderColumns: function(db, table) {

        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_FULL_FIELDS', db, table),
            success: function(config, response) {

                this.openWindow('table.ReorderColumns', db, table, response);
            }
        });
    },

    openAdvancedProperties: function(db, table) {

        this.tunneling({
            db     : db,
            query  : this.getAPIS().getQuery('SHOW_ADVANCED_PROPERTIES', db, table),
            success: function(config, response) {

                this.openWindow('table.AdvancedProperties', db, table, response);
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

    alterDatabase: function(db) {

        this.openCreateDatabaseWindow(db);
    },

    dropDatabase: function(db, callback) {

        Ext.Msg.confirm('Drop Database \'' + db + '\'', 'Do you really want to drop the database?\n\nWarning: You will lose all data!', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('DROP_DATABASE', db),
                    success: function(config, response) {

                        if (callback) {

                            callback(config, response);
                        }
                    }
                });
            }
        }, this);
    },

    truncateDatabase: function(db, callback) {

        var app = this;

        Ext.Msg.confirm('Truncate Database \'' + db + '\'', 'Do you really want to truncate the database?\n\nWarning: You will lose all data!', function(btn, text) {

            if (btn == 'yes') {

                var queries = [], messages = [];

                app.tunneling({
                    db     : db,
                    query  : app.getAPIS().getQuery('SHOW_DATABASE_TABLES', db),
                    success: function(config, response) {

                        Ext.Array.each(response.records, function(row, idx) {

                            var table = row[0];
                            queries.push(app.getAPIS().getQuery('DROP_TABLE', db, table, ''));
                        });

                        this.tunnelings(db, queries, {
                            prevAllQueries : function(queries) {

                                app.setLoading(true);
                            },
                            failureQuery   : function(idx, query, config, response) {

                                messages.push(app.generateQueryErrorMsg(query, response.message));
                            },
                            afterAllQueries: function(queries, results) {

                                app.setLoading(false);

                                if (messages.length > 0) {

                                    app.openMessage(messages);
                                }
                                else {

                                    if (callback) {

                                        callback(queries, results);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        }, this);
    },

    emptyDatabase: function(db, callback) {

        Ext.Msg.confirm('Empty Database \'' + db + '\'', 'Do you really want to empty the database?\n\nWarning: You will lose all data!', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : 'EMPTY DATABASE `' + db + '`',
                    success: function(config, response) {

                        if (callback) {

                            callback(config, response);
                        }
                    }
                });
            }
        }, this);
    },

    renameTable: function(db, table, callback) {

        Ext.Msg.prompt('Rename Table \'' + table + '\' in \'' + db + '\'', 'Please enter new table name:', function(btn, text) {

            if (btn == 'ok') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('RENAME_TABLE', db, table, db, text),
                    success: function(config, response) {

                        if (callback) {

                            callback(config, response, text);
                        }
                    }
                });
            }
        }, this, false, table);
    },

    truncateTable: function(db, table, callback) {

        Ext.Msg.confirm('Truncate Table \'' + table + '\' in \'' + db + '\'', 'Do you really want to truncate the table?\n\nWarning: You will lose all data!', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : this.getAPIS().getQuery('TRUNCATE_TABLE', db, table),
                    success: function(config, response) {

                        if (callback) {

                            callback(config, response);
                        }
                    }
                });
            }
        }, this);
    },

    dropTable: function(db, table, callback) {

        Ext.Msg.confirm('Drop Table \'' + table + '\' in \'' + db + '\'', 'Do you really want to drop the table?\n\nWarning: You will lose all data!', function(btn, text) {

            if (btn == 'yes') {

                this.tunneling({
                    db     : db,
                    query  : 'DROP TABLE `' + db + '`.`' + table + '`',
                    success: function(config, response) {

                        if (callback) {

                            callback(config, response);
                        }
                    }
                });
            }
        }, this);
    },

    duplicateTable: function(db, table, callback) {

        var app = this;

        Ext.Msg.prompt('Duplicate Table \'' + table + '\' in \'' + db + '\'', 'Please enter new table name:', function(btn, name) {

            if (btn == 'ok') {

                var queries = [
                        app.getAPIS().getQuery('COPY_TABLE_STRUCTURE', db, table, db, name),
                        app.getAPIS().getQuery('COPY_TABLE_DATA', db, table, db, name)
                    ],
                    messages = [];

                this.tunnelings(db, queries, {
                    failureQuery   : function(idx, query, config, response) {

                        messages.push(app.generateQueryErrorMsg(query, response.message));
                    },
                    afterAllQueries: function(queries, results) {

                        app.setLoading(false);

                        if (messages.length > 0) {

                            app.openMessage(messages);
                        }
                        else {

                            if (callback) {

                                callback(queries, results);
                            }
                        }
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
            db = this.getSelectedDatabase();

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

                this.setLoading(true);

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
                            messages.push(this.generateQuerySuccessMsg(query.getSQL(), msg));
                        }

                        this.setLoading(false);

                        tunneling();
                    },
                    failure: function(config, response) {

                        messages.push(this.generateError(query.getSQL(), response.message));

                        this.setLoading(false);

                        tunneling();
                    }
                })
            }
            else {

                this.setLoading(false);

                this.afterExecuteQuery(messages);
                this.reloadTree();
            }

        }, this))();
    },

    afterExecuteQuery: function(messages) {

        if (messages.length == 0) { return; }

        this.openMessage(messages);
    },

    setLoading: function(loading) {

        var connTab = this.getActiveConnectTab();
        connTab.setLoading(loading);

        var stopBtn = Ext.getCmp('toolbar-stop-operation');

        stopBtn.setDisabled(!loading);
    },

    stopOperation: function() {

        Ext.data.JsonP.abort();
        Ext.Ajax.abortAll();
        this.setLoading(false);
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

    openTable: function(db, table) {

        var tab = this.getActiveTableDataTab(),
            parser = Ext.create('Planche.lib.QueryParser', this.getAPIS()),
            queries = parser.parse(this.getAPIS().getQuery('SELECT_TABLE', db, table, "*", '')),
            query = queries[0];

        this.openMode = 'select';

        this.setLoading(true);

        this.tunneling({
            db     : db,
            query  : query.getSQL(),
            tab    : tab,
            success: function(config, response) {

                this.initQueryResult({openTable: table}, db, query, response);
                this.setLoading(false);
            },
            failure: function(config, response) {

                this.openMessage(this.generateQueryErrorMsg(config.query, response.message));
                this.setLoading(false);
            }
        });
    },

    countTable: function(db, table) {

        var tab = this.getActiveTableDataTab(),
            parser = Ext.create('Planche.lib.QueryParser', this.getAPIS()),
            queries = parser.parse(this.getAPIS().getQuery('SELECT_COUNT', db, table, "*", '')),
            query = queries[0];

        this.openMode = 'count';

        this.setLoading(true);

        this.tunneling({
            db     : db,
            query  : query.getSQL(),
            tab    : tab,
            success: function(config, response) {

                this.initQueryResult({openTable: table}, db, query, response);
                this.setLoading(false);
            },
            failure: function(config, response) {

                this.openMessage(this.generateQueryErrorMsg(config.query, response.message));
                this.setLoading(false);
            }
        });
    },

    makeRecords: function(fields, records) {

        var tmp = [];
        Ext.Array.each(records, function(row, ridx) {

            if (!row) return;

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
    },

    loadQuickCommands: function(tab) {

        var app = this,
            api = app.getAPIS(),
            tree = app.getSelectedTree(),
            root = tree.getRootNode(),
            children = root.childNodes;

        var queries = [],
            messages = [],
            dbs = [];

        app.onTask = true;
        app.updateTaskMessage('Start quick command indexing');

        tab.quickCommand.append({
            icon  : 'execute-query',
            name  : 'Run/Execute Query',
            value : 0,
            method: app.executeQuery
        });
        tab.quickCommand.append({
            icon  : 'connection',
            name  : 'New Connection',
            value : 0,
            method: app.openConnPanel
        });
        tab.quickCommand.append({
            icon  : 'user',
            name  : 'User Manager',
            value : 0,
            method: app.openUserPanel
        });
        tab.quickCommand.append({
            icon  : 'proc',
            name  : 'Show process list',
            value : 0,
            method: app.openProcessPanel
        });
        tab.quickCommand.append({
            icon  : 'fullscreen',
            name  : 'Change to fullscreen',
            value : 0,
            method: app.changeToFullscreen
        });
        tab.quickCommand.append({
            icon  : 'database',
            name  : 'Create database',
            value : 0,
            method: app.createDatabase
        });
        tab.quickCommand.append({
            icon  : 'vars',
            name  : 'Show variables',
            value : 0,
            method: app.openVariablesPanel
        });
        tab.quickCommand.append({
            icon  : 'status',
            name  : 'Show status',
            value : 0,
            method: app.openStatusPanel
        });
        tab.quickCommand.append({
            icon  : 'flush',
            name  : 'Flush',
            value : 0,
            method: app.openFlushPanel
        });

        var withoutIndexing = Planche.config.withoutIndexing || [];
        app.tunneling({
            query  : app.getAPIS().getQuery('SHOW_DATABASE'),
            success: function(config, response) {

                Ext.Array.each(response.records, function(row) {

                    var db = row[0];
                    if (withoutIndexing.indexOf(db) > -1) {

                        return;
                    }

                    queries.push(api.getQuery('SHOW_ALL_TABLE_STATUS', db));
                    dbs.push(db);

                    tab.quickCommand.append({
                        icon  : 'database',
                        name  : 'Drop database ' + db,
                        value : 0,
                        method: app.dropDatabase,
                        params: [db]
                    });

                    tab.quickCommand.append({
                        icon  : 'database',
                        name  : 'Alter database ' + db,
                        value : 0,
                        method: app.alterDatabase,
                        params: [db]
                    });

                    tab.quickCommand.append({
                        icon  : 'database',
                        name  : 'Truncate database ' + db,
                        value : 0,
                        method: app.truncateDatabase,
                        params: [db]
                    });

                    tab.quickCommand.append({
                        icon  : 'database',
                        name  : 'Empty database ' + db,
                        value : 0,
                        method: app.emptyDatabase,
                        params: [db]
                    });
                });

                if (response.records.length == 0) {

                    app.onTask = false;
                    return;
                }

                var total = queries.length,
                    jobIdx = 1;
                this.tunnelings('', queries, {
                    failureQuery   : function(idx, query, config, response) {

                        messages.push(app.generateQueryErrorMsg(query, response.message));
                    },
                    successQuery   : function(idx, query, config, response) {

                        var db = dbs[jobIdx - 1];
                        Ext.Array.each(response.records, function(row, idx) {

                            var table = row[0];

                            app.updateTaskMessage('Indexing `' + db + '`.`' + table + '`');

                            tab.quickCommand.append({
                                icon  : 'table',
                                name  : 'Open ' + table,
                                value : 0,
                                method: app.openTable,
                                params: [db, table]
                            });
                            tab.quickCommand.append({
                                icon  : 'table',
                                name  : 'Count ' + table,
                                value : 0,
                                method: app.countTable,
                                params: [db, table]
                            });
                            tab.quickCommand.append({
                                icon  : 'sql',
                                name  : 'Paste SQL: Select ' + table,
                                value : 0,
                                method: app.pasteSQLStatement,
                                params: [db, table, 'select']
                            });
                            tab.quickCommand.append({
                                icon  : 'sql',
                                name  : 'Paste SQL: Update ' + table,
                                value : 0,
                                method: app.pasteSQLStatement,
                                params: [db, table, 'update']
                            });
                            tab.quickCommand.append({
                                icon  : 'sql',
                                name  : 'Paste SQL: Delete ' + table,
                                value : 0,
                                method: app.pasteSQLStatement,
                                params: [db, table, 'delete']
                            });
                            tab.quickCommand.append({
                                icon  : 'sql',
                                name  : 'Paste SQL: Insert ' + table,
                                value : 0,
                                method: app.pasteSQLStatement,
                                params: [db, table, 'insert']
                            });
                            tab.quickCommand.append({
                                icon  : 'table',
                                name  : 'Alter Table ' + table,
                                value : 0,
                                method: app.openAlterTableWindow,
                                params: [db, table]
                            });
                            tab.quickCommand.append({
                                icon  : 'table',
                                name  : 'Rename Table ' + table,
                                value : 0,
                                method: app.renameTable,
                                params: [db, table]
                            });
                            tab.quickCommand.append({
                                icon  : 'table',
                                name  : 'Truncate Table ' + table,
                                value : 0,
                                method: app.truncateTable,
                                params: [db, table]
                            });
                            tab.quickCommand.append({
                                icon  : 'table',
                                name  : 'Drop Table From Database ' + table,
                                value : 0,
                                method: app.dropTable,
                                params: [db, table]
                            });
                            tab.quickCommand.append({
                                icon  : 'table',
                                name  : 'Reorder Column(s) ' + table,
                                value : 0,
                                method: app.openReorderColumns,
                                params: [db, table]
                            });
                            tab.quickCommand.append({
                                icon  : 'table',
                                name  : 'View Advanced Properties ' + table,
                                value : 0,
                                method: app.openAdvancedProperties,
                                params: [db, table]
                            });
                        });

                        app.updateTaskProgressBar(jobIdx / total);
                        jobIdx++;
                    },
                    afterAllQueries: function() {

                        if (messages.length == 0) {

                            app.updateTaskMessage('Indexing completed');
                            app.onTask = false;
                            return;
                        }

                        app.updateTaskMessage('Indexing Error');
                        app.openMessage(messages);
                        app.onTask = false;
                    }
                });
            },
            failure: function(config, response) {

                app.updateTaskMessage(response.message);
                app.onTask = false;
            }
        });
    },

    changeToFullscreen: function() {

        // mozilla proposal
        var elem = Ext.getBody().el.dom;

        if (elem.requestFullscreen) {

            elem.requestFullscreen();

        } else if (elem.mozRequestFullScreen) {

            elem.mozRequestFullScreen();

        } else if (elem.webkitRequestFullscreen) {

            elem.webkitRequestFullscreen();
        }
        else {

            Ext.Msg.alert('info', 'This browser is not support fullscreen mode');
        }
    }
});
