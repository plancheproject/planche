
Ext.application({
    name: 'Planche',

    extend: 'Planche.Application',
    history     : [],
    autoCreateViewport: true,

    /**
     * launch planche
     *
     * @class Ext.application
     * @constructor
     */
    launch : function() {

        // setup the state provider, all state information will be saved to a cookie
        Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

        //stop backspace
        Ext.EventManager.addListener(Ext.getBody(), 'keydown', function(e){

            if(e.getTarget().type != 'text' && e.getKey() == '8' ){
                e.preventDefault();
            }
        });

        window.onbeforeunload = function(){

            var message = "Are you sure you want to quit planche?";
            return message;
        }

        this.initKeyMap();
    },

    /**
     * Return context menu component of scheme tree in left side bar
     *
     * @access public
     * @method getSchemeContextMenu
     */
    getSchemeContextMenu : function(){

        return Ext.getCmp('scheme-context-menu');
    },

    /**
     * Return toolbar component
     *
     * @access public
     * @method getToolBar
     */
    getToolBar : function(){

    	return Ext.getCmp('planche-toolbar');
    },

    /**
     * Return connect tabpanel
     *
     * @access public
     * @method getConnectTabPanel
     */
    getConnectTabPanel : function(){

    	return Ext.getCmp('connect-tab-panel');
    },

    /**
     * Return active connected tab
     *
     * @access public
     * @method getActiveConnectTab
     */
    getActiveConnectTab : function(){

    	var mainTab = this.getConnectTabPanel();
    	return mainTab.getActiveTab();
    },


    /**
     * Close the active connection tab
     *
     * @access public
     * @method closeActiveConnectionTab
     */
     closeActiveConnectionTab : function(){

        var tab = this.getActiveConnectTab();
        if(!tab) return;

        tab.destroy();
    },

    /**
     * Return active query tabpanel in active connect tab
     *
     * @access public
     * @method getQueryTabPanel
     */
    getQueryTabPanel : function(){
    	try {

    		return this.getActiveConnectTab().down("tabpanel");
	    }
    	catch(e){
    		return null;
    	}
    },

    /**
     * Return active query tab in active query tabpanel
     *
     * @access public
     * @method getActiveQueryTab
     */
    getActiveQueryTab : function(){

    	try {
    		return this.getQueryTabPanel().getActiveTab();
    	}
    	catch(e){
    		return null;
    	}
    },

    /**
     * Return active result tab in active query tab
     *
     * @access public
     * @method getActiveResultTabPanel
     */
    getActiveResultTabPanel : function(){

    	try {

    		return this.getActiveQueryTab().down('tabpanel');
    	}
    	catch(e){

    		return null;
    	}
    },	    

    /**
     * destory active result tab in active result tabpanel
     *
     * @access public
     * @method getActiveResultTabPanel
     */
    removeResultTabPanel : function(){

        var tabpanel = this.getActiveResultTabPanel();
        tabpanel.items.each(function(cmp, idx){ if(idx > 3) cmp.destroy() });
    },

    /**
     * Return query editor in active query tab
     *
     * @access public
     * @method getActiveResultTabPanel
     */
    getActiveEditor : function(){

    	try {
    		return this.getActiveQueryTab().down('query-editor').getEditor();
    	}
    	catch(e){
    		return null;
    	}
    },

	getActiveTableDataTab : function(){

    	try {
    		return this.getActiveQueryTab().down("table-data-tab");
    	}
    	catch(e){
    		return null;
    	}
	},

	getActiveInfoTab : function(){

    	try {
    		return this.getActiveQueryTab().down("info-tab");
    	}
    	catch(e){
    		return null;
    	}
	},

	getActiveHistoryTab : function(){

    	try {
    		return this.getActiveQueryTab().down("history-tab").getEditor();
    	}
    	catch(e){
    		return null;
    	}
	},

	getActiveMessageTab : function(){

    	try {
    		return this.getActiveQueryTab().down("message-tab");
    	}
    	catch(e){
    		return null;
    	}
	},

	getAPIS : function(){

		return this.getActiveConnectTab().getAPIS();
	},

	getSelectedTree : function(){

		return Planche.selectedTree;
	},

    setSelectedTree : function(tree){

        Planche.selectedTree = tree;
        var node = Planche.selectedNode = tree.getSelectionModel().getSelection()[0];
    },
    
	getSelectedNode : function(){

		return Planche.selectedNode;
	},

	getParentNode : function(n, depth, return_node){

        if(!n) return null;
		if(typeof depth == "undefined"){ depth = 1; }
		if(!n.parentNode){ return null; }
		if(n.data.depth != depth){ 

            while(n.parentNode && n.parentNode.data.depth >= depth) {

                n = n.parentNode;
            }
        }

        if(return_node) {

        	return n;
        }
        else {
        	
			return n.data.text;
		}
	},

    checkToolbar : function(){

        var cnt = this.getConnectTabPanel().items.getCount();

        Ext.Array.each(this.getToolBar().items.getRange(1), function(obj, idx){
            
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
    openWindow : function(id){

        var args = Ext.toArray(arguments);
        args.shift();

    	Ext.require('Planche.controller.'+id, function(){

	        var ctrl = this.getController(id);

	        var cmp = Ext.getCmp('window-'+id);

	        if(cmp){

	        	cmp.show();
	        }
	        else {

		        ctrl.initWindow.apply(ctrl, args);
	        }
    	}, this);
    },

    initConnectTab : function(connInfo){

        var 
        main = this.getConnectTabPanel(),
        tab = Ext.create('Planche.view.layout.ConnectTab', Ext.Object.merge({
            title : connInfo.hostName
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
	initKeyMap : function(){

		// map multiple keys to multiple actions by strings and array of codes
		var map = new Ext.util.KeyMap({
		    target: Ext.getBody(),
		    binding: [{
		    	scope : this,
		        key: Ext.EventObject.F9,
		        fn: function(){ 

		        	this.executeQuery();
		        }
		    },{
		    	scope : this,
		        key: Ext.EventObject.T,
		        alt : true,
		        fn: function(keyCode, e){ 

		        	this.openQueryTab();
		        }
		    },{
		    	scope : this,
		        key: Ext.EventObject.N,
		        alt : true,
		        fn: function(keyCode, e){ 

		        	this.openConnPanel();
		        }
		    },{
		    	scope : this,
		        key: Ext.EventObject.F,
		        alt : true,
		        fn: function(keyCode, e){ 

		        	this.openFindPanel();
		        }
		    },{
		    	scope : this,
		        key: Ext.EventObject.P,
		        alt : true,
		        fn: function(keyCode, e){ 

		        	this.openQuickPanel();
		        }
		    },{
		    	scope : this,
		        key: Ext.EventObject.U,
		        alt : true,
		        fn: function(keyCode, e){ 

		        	this.openUserPanel();
		        }
		    },{
		    	scope : this,
		        key: Ext.EventObject.ESC,
		        fn: function(keyCode, e){

		        	var cmp = Ext.getCmp('window-quick');
		        	if(!cmp){ return; }
		        	cmp.destroy();
		        }
		    }]
		});
	},

    pushHistory : function(t, q){

        this.history.push('/* '+Ext.Date.format(new Date(), 'Y-m-d h:i:s')+' 0ms */ '+q.replace(/[\t\n]+/gi, " "));

        try {

            var editor = this.getActiveHistoryTab();
            editor.setValue(this.history.join("\n"));
        }
        catch(e){

        }
    },

    /**
     * execute query
     *
     * @method tunneling
     * @param {String} config
     */
    tunneling : function(config){

        var tab = this.getActiveConnectTab();

        Ext.applyIf(config, {
            db          : '',
            query       : '',
            type        : 'query',
            async       : true,
            success     : function(config, response){

                var msg = response.affected_rows+' row(s) affected<br>';
                msg += 'Execution Time : 00:00:00:000<br>';
                msg += 'Transfer Time  : 00:00:00:000<br>';
                msg += 'Total Time     : 00:00:00:000';
                this.openMessage(msg);
            },
            failure     : function(config, response){

                this.openMessage(response.message);
            }
        });

        Ext.data.JsonP.request({
            url        : tab.getTunnelingURL(),
            callbackKey: 'callback',
            async      : config.async,
            params     : {
                db     : config.db,
                host   : tab.getHost(),
                user   : tab.getUser(),
                pass   : tab.getPass(),
                charset: tab.getCharset(),
                port   : tab.getPort(),
                query  : config.query,
                type   : config.type
            },
            scope : this,
            success: function(response) {

                //var response = Ext.JSON.decode(response.responseText);

                if(response.success == true){

                    var t = '';
                    this.pushHistory(t, config.query);
                    config.success.apply(this, [config, response]);
                }
                else {

                    config.failure.apply(this, [config, response]);
                }
            },
            failure : function(response){
                
                config.failure.apply(this, [config, response]);
            }
        });
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
    multipleTunneling : function(db, queries, callbacks, scope){

        if(typeof scope == 'undefined') {

            scope = this;
        }

        var app = this.getApplication(), tunneling, idx = 0, results = [];

        Ext.applyIf(callbacks, {
            'prevAllQueries' : function(){},
            'prevQuery' : function(){},
            'successQuery' : function(){},
            'failureQuery' : function(){},
            'afterQuery' : function(){},
            'afterAllQueries' : function(){}
        });

        callbacks['prevAllQueries'].apply(scope, [queries]);

        (tunneling = function(){

            var query = queries.shift();

            if(query) {

                callbacks['prevQuery'].apply(scope, [idx, query]);

                app.tunneling({
                    db : db,
                    query : query,
                    success : function(config, response){

                        callbacks['successQuery'].apply(scope, [idx, query, config, response]);

                        results.push({
                            config : config, 
                            response : response
                        });

                        tunneling();
                    },
                    failure : function(config, response){

                        callbacks['failureQuery'].apply(scope, [idx, query, config, response]);

                        results.push({
                            config : config, 
                            response : response
                        });

                        tunneling();
                    }
                });

                callbacks['afterQuery'].apply(scope, [idx, query]);

                idx++;
            }
            else {

                //complete all query
                callbacks['afterAllQueries'].apply(scope, [queries, results]);
            }
        })();
    },

    pasteSQLStatement : function(mode, node){

        var db = this.getParentNode(node),
            table  = node.data.text,
            a      = [], b = [],
            api    = this.getAPIS();

        var func    = {
            'insert' : Ext.Function.bind(function(records){

                Ext.Array.each(records, function(row, idx){

                    a.push("`"+row[0]+"`");
                    b.push("'"+row[0]+"'");
                });
                return api.getQuery('INSERT_TABLE', db, table, a.join(','), b.join(','));
            }, this),
            'update' : Ext.Function.bind(function(records){

                Ext.Array.each(records, function(row, idx){

                    a.push("`"+row[0]+"`='"+row[0]+"'");
                    if(row[3] == "PRI"){ b.push("`"+row[0]+"`='"+row[0]+"'"); }
                });
                return api.getQuery('UPDATE_TABLE', db, table, a.join(',\n'), b.join(' AND '));
            }, this),
            'delete' : Ext.Function.bind(function(records){

                Ext.Array.each(records, function(row, idx){

                    if(row[3] == "PRI"){ a.push("`"+row[0]+"`='"+row[0]+"'"); }
                });
                return api.getQuery('DELETE_TABLE', db, table, a.join(' AND '));
            }, this),
            'select' : Ext.Function.bind(function(records){

                Ext.Array.each(records, function(row, idx){

                    a.push("`"+row[0]+"`");
                });
                return api.getQuery('SELECT_TABLE', db, table, a.join(', '));
            }, this)
        };

        this.tunneling({
            db : db,
            query : 'DESCRIBE `'+db+'`.`'+table+'`',
            success : function(config, response){

                query = this.alignmentQuery(func[mode](response.records));
                this.setActiveEditorValue(query);
            }
        });
    },

    changeTableToType : function(engine){

        var node    = this.getSelectedNode();
        var db      = this.getParentNode(node);
        var table   = node.data.text;

        this.tunneling({
            db : db,
            query : this.getAPIS().getQuery('CHANGE_TABLE_TYPE', db, table, engine),
            success     : function(config, response){

                this.openMessage('Table engine changed to '+engine);
            }
        });
    },

    createView : function(){

        var node = this.getSelectedNode();
        var db = this.getParentNode(node);
        Ext.Msg.prompt('Create View', 'Please enter new view name:', function(btn, text){

            if (btn == 'ok'){

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_VIEW', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterView : function(){

        var node = this.getSelectedNode(),
            db   = this.getParentNode(node),
            name = node.getData().text;

        this.tunneling({
            db : db,
            query : this.getAPIS().getQuery('SHOW_CREATE_VIEW', db, name),
            node : node,
            success : function(config, response){

                this.openQueryTab();

                var body  = this.getAPIS().getQuery('ALTER_VIEW', db, name, response.records[0][1]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    createProcedure : function(){

        var node = this.getSelectedNode(),
            db   = this.getParentNode(node);
        Ext.Msg.prompt('Create Procedure', 'Please enter new procedure name:', function(btn, name){

            if (btn == 'ok'){

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_PROCEDURE', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterProcedure : function(){

        var node = this.getSelectedNode(),
            db   = this.getParentNode(node),
            name = node.getData().text;
        this.tunneling({
            db : db,
            query : this.getAPIS().getQuery('SHOW_CREATE_PROCEDURE', db, name),
            node : node,
            success : function(config, response){

                if(response.records.length == 0){

                    return;
                }

                if(!response.records[0][2]){

                    Ext.Msg.alert('error', 'Unable to retrieve information. Please check your permission.');
                    return;
                }

                this.openQueryTab();

                var body  = this.getAPIS().getQuery('ALTER_PROCEDURE', db, name, response.records[0][2]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    createFunction : function(){

        var node = this.getSelectedNode(),
            db   = this.getParentNode(node);
        Ext.Msg.prompt('Create Function', 'Please enter new function name:', function(btn, name){

            if (btn == 'ok'){

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_FUNCTION', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterFunction : function(){

        var node = this.getSelectedNode(),
            db   = this.getParentNode(node),
            name = node.getData().text;
        this.tunneling({
            db : db,
            query : this.getAPIS().getQuery('SHOW_CREATE_FUNCTION', db, name),
            node : node,
            success : function(config, response){

                if(response.records.length == 0){

                    return;
                }

                if(!response.records[0][2]){

                    Ext.Msg.alert('error', 'Unable to retrieve information. Please check your permission.');
                    return;
                }

                this.openQueryTab();

                var body  = this.getAPIS().getQuery('ALTER_FUNCTION', db, name, response.records[0][2]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    createTrigger : function(){

        var node = this.getSelectedNode(),
            db   = this.getParentNode(node);
        Ext.Msg.prompt('Create Trigger', 'Please enter new trigger name:', function(btn, name){

            if (btn == 'ok'){

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_TRIGGER', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterTrigger : function(){

        var node = this.getSelectedNode(),
            db   = this.getParentNode(node),
            name = node.getData().text.match(/.+?\b/)[0];
        this.tunneling({
            db : db,
            query : this.getAPIS().getQuery('SHOW_CREATE_TRIGGER', db, name),
            node : node,
            success : function(config, response){

                this.openQueryTab();

                var body  = this.getAPIS().getQuery('ALTER_TRIGGER', db, name, response.records[0][2]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },

    createEvent : function(){

        var node = this.getSelectedNode();
        var db = this.getParentNode(node);
        Ext.Msg.prompt('Create Event', 'Please enter new event name:', function(btn, name){

            if (btn == 'ok'){

                this.openQueryTab();

                var sql = this.alignmentQuery(this.getAPIS().getQuery('CREATE_EVENT', db, name));
                this.setActiveEditorValue(sql);
            }
        }, this);
    },

    alterEvent : function(){

        var node = this.getSelectedNode(),
            db   = this.getParentNode(node),
            name = node.getData().text;
        this.tunneling({
            db : db,
            query : this.getAPIS().getQuery('SHOW_CREATE_EVENT', db, name),
            node : node,
            success : function(config, response){

                this.openQueryTab();

                var body  = this.getAPIS().getQuery('ALTER_EVENT', db, name, response.records[0][3]),
                    query = this.alignmentQuery(body);
                this.setActiveEditorValue(query);
            }
        });
    },


    openConnPanel : function(){

        this.openWindow('connection.Connect');
    },

    openFindPanel : function(){

        this.openWindow('command.Find');
    },

    openUserPanel : function(){

        var node = this.getSelectedNode();
        var db = this.getParentNode(node);
        this.tunneling({
            db : db,
            query : this.getAPIS().getQuery('SELECT_USER', db),
            success : function(config, response){

                this.openWindow('user.Users', db, node.data.text, response);
            }
        });
    },

    openTokenPanel : function(tokens){

        this.openWindow('query.Token', tokens);
    },

    openProcessPanel : function(){

        this.openWindow('command.Process');
    },

    openFlushPanel : function(){

        this.openWindow('command.Flush');
    },

    openStatusPanel : function(){

        this.openWindow('command.Status');
    },

    openFlushPanel : function(){

        this.openWindow('command.Flush');
    },

    openVariablesPanel : function(){

        this.openWindow('command.Variables');
    },

    openQuickPanel : function(records){

        var db = this.getParentNode(this.getSelectedNode());
        this.tunneling({
            db : db,
            query : this.getAPIS().getQuery('SHOW_ALL_TABLE_STATUS', db),
            success : function(config, response){

                this.openWindow('command.Quick', response);
            }
        });
    },

    openAlterTableWindow : function(node){

        var db = this.getParentNode(node);
        this.tunneling({
            db : db,
            query : 'SHOW FULL FIELDS FROM `'+db+'`.`'+node.data.text+'`',
            success : function(config, response){

                this.openWindow('table.EditScheme', db, node.data.text, response);
            }
        });
    },

    openCreateTableWindow : function(){

        var node = this.getSelectedNode();
        var db = this.getParentNode(node);

        this.openWindow('table.EditScheme', db);
    },

    openCreateDatabaseWindow : function(node){

        this.openWindow('database.CreateDatabase', node);
    },

    openReorderColumns : function(node){

        var db = this.getParentNode(node);
        this.tunneling({
            db : db,
            query : this.getAPIS().getQuery('SHOW_FULL_FIELDS', db, node.data.text),
            success : function(config, response){

                this.openWindow('table.ReorderColumns', db, node.data.text, response);
            }
        });
    },

    openAdvancedProperties : function(node){

        var db = this.getParentNode(node);
        this.tunneling({
            db : db,
            query : this.getAPIS().getQuery('SHOW_ADVANCED_PROPERTIES', db, node.data.text),
            success : function(config, response){

                this.openWindow('table.AdvancedProperties', db, node.data.text, response);
            }
        });
    },

    openQueryTab : function(){

        this.initQueryTab('Query');
    },




    createDatabase : function(){

        this.openCreateDatabaseWindow();
    },

    alterDatabase : function(node){

        this.openCreateDatabaseWindow(node);
    },

    dropDatabase : function(node){

        var db = node.data.text;
        Ext.Msg.confirm('Drop Database \''+db+'\'', 'Do you really want to drop the database?\n\nWarning: You will lose all data!', function(btn, text){

            if (btn == 'yes'){

                this.tunneling({
                    db : db,
                    query : this.getAPIS().getQuery('DROP_DATABASE', db),
                    success : function(config, response){

                        this.getSelectedTree().getSelectionModel().select(node.parentNode);
                        node.remove();
                    }
                });
            }
        }, this);
    },

    truncateDatabase : function(node){

        var db = node.data.text,
            app = this;

        Ext.Msg.confirm('Truncate Database \''+db+'\'', 'Do you really want to truncate the database?\n\nWarning: You will lose all data!', function(btn, text){

            if (btn == 'yes'){

                var queries = [], messages = [];

                app.tunneling({
                    db : db,
                    query : app.getAPIS().getQuery('SHOW_DATABASE_TABLES', db),
                    success : function(config, response){

                        Ext.Array.each(response.records, function(row, idx){

                            var table = row[0];
                            queries.push(app.getAPIS().getQuery('DROP_TABLE', db, table));
                        });

                        this.multipleTunneling(db, queries, {
                            'prevAllQueries' : function(){

                                app.getActiveConnectTab().setLoading(true);
                            },
                            'failureQuery'   : function(){

                                messages.push(app.generateErrorMessage(query, response.message));
                            },
                            'afterAllQueries': function(){ 

                                app.getActiveConnectTab().setLoading(false);

                                if(messages.length > 0){

                                    app.openMessage(messages);
                                }
                                else {

                                    Ext.Array.each(node.childNodes, function(childNode, idx){

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

    emptyDatabase : function(node){

        var db = node.data.text;
        Ext.Msg.confirm('Empty Database \''+db+'\'', 'Do you really want to empty the database?\n\nWarning: You will lose all data!', function(btn, text){

            if (btn == 'yes'){

                this.tunneling({
                    db : db,
                    query : 'EMPTY DATABASE `'+db+'`',
                    success : function(config, response){

                        
                    }
                });
            }
        }, this);
    },

    renameTable : function(node){

        var db = this.getParentNode(node);
        var table = node.data.text;
        Ext.Msg.prompt('Rename Table \''+table+'\' in \''+db+'\'', 'Please enter new table name:', function(btn, text){

            if (btn == 'ok'){

                this.tunneling({
                    db : db,
                    query : this.getAPIS().getQuery('RENAME_TABLE', db, table, db, text),
                    success : function(config, response){

                        node.set('text', text);
                    }
                });
            }
        }, this, false, table);
    },

    truncateTable : function(node){

        var db = this.getParentNode(node);
        var table = node.data.text;
        Ext.Msg.confirm('Truncate Table \''+table+'\' in \''+db+'\'', 'Do you really want to truncate the table?\n\nWarning: You will lose all data!', function(btn, text){

            if (btn == 'yes'){

                this.tunneling({
                    db : db,
                    query : this.getAPIS().getQuery('TRUNCATE_TABLE', db, table),
                    success : function(config, response){

                        this.openTable(node);
                    }
                });
            }
        }, this);
    },

    dropTable : function(node){

        var db = this.getParentNode(node);
        var table = node.data.text;
        Ext.Msg.confirm('Drop Table \''+table+'\' in \''+db+'\'', 'Do you really want to drop the table?\n\nWarning: You will lose all data!', function(btn, text){

            if (btn == 'yes'){

                this.tunneling({
                    db : db,
                    query : 'DROP TABLE `'+db+'`.`'+table+'`',
                    success : function(config, response){

                        this.getSelectedTree().getSelectionModel().select(node.parentNode);
                        node.remove();
                    }
                });
            }
        }, this);
    },




    setActiveEditorValue : function(v){

        var editor = this.getActiveEditor();
        t = editor.getValue();
        editor.setValue(t ? t + "\n" + v : v);
    },



    parseQuery : function(query){

        var parser = Ext.create('Planche.lib.QueryParser', this.getAPIS()),
        queries = parser.parse(query);

        return queries;
    },

    alignmentQuery : function(query){

        if(typeof query == 'string'){

            var queries = this.parseQuery(query);               

            if(queries.length == 0){

                return query;
            }

            var tmp = [];
            Ext.Array.each(queries, function(query, idx){

                tmp.push(Planche.lib.QueryAlignment.alignment(query));
            });

            tmp = tmp.join('\n');

            return tmp;
        }

        return Planche.lib.QueryAlignment.alignment(query);
    },

    formatQuery : function(query){

        if(query){

            var queries = query;
        }
        else {

            var editor = this.getActiveEditor();

            if(!editor){ return; }

            if(editor.somethingSelected()){

                var queries = editor.getSelection();
            }
            else {
            
                var queries = editor.getValue();
            }
        }

        var parser = Ext.create('Planche.lib.QueryParser', this.getAPIS());
        queries = parser.parse(queries);

        if(queries.length == 0){

            return;
        }

        var tmp = [];
        Ext.Array.each(queries, function(query, idx){

            tmp.push(Planche.lib.QueryAlignment.alignment(query));
        });

        tmp = tmp.join('\n\n');

        if(query){

            return tmp;
        }
        else{

            if(editor.somethingSelected()){

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
    executeQuery : function(){

        var queries = this.getParsedQuery();

        if(queries.length == 0){

            this.openMessage('No query(s) were executed. Please enter a query in the SQL window or place the cursor inside a query.');
            return;
        }

        this.removeResultTabPanel();

        var panel = this.getActiveMessageTab(),
            dom = Ext.get(panel.getEl().query("div[id$=innerCt]")),
            node = this.getSelectedNode(),
            db = this.getParentNode(node);

        dom.setHTML('');

        if(!db){

            this.openMessage('No database selected.');
            return;
        }

        var tunneling;
        var messages = [];
        (tunneling = Ext.Function.bind(function(){

            var query = queries.shift();

            if(query) {

                if(query.isDelimiter() == true){

                    tunneling();
                    return;
                }
            
                this.getActiveConnectTab().setLoading(true);

                this.tunneling({
                    db : db,
                    query : query.getSQL(),
                    success : function(config, response){

                        if(response.is_result_query == true){

                            var grid = this.initQueryResult({
                                icon   : 'images/icon_table.png',
                                closable : true,
                                title : 'Result'
                            }, db, query, response),

                            tabpanel = this.getActiveResultTabPanel();

                            tabpanel.add(grid);
                            tabpanel.setActiveTab(grid);
                        }
                        else {

                            var msg = response.affected_rows+' row(s) affected<br/><br/>';
                            msg += 'Execution Time : '+response.exec_time+'<br/>';
                            msg += 'Transfer Time  : '+response.transfer_time+'<br/>';
                            msg += 'Total Time     : '+response.total_time;
                            messages.push(query.getSQL()+'<br/><br/>'+msg);
                        }

                        this.getActiveConnectTab().setLoading(false);
                        tunneling();
                    },
                    failure : function(config, response){

                        messages.push(this.generateErrorMessage(query.getSQL(), response.message));

                        this.getActiveConnectTab().setLoading(false);

                        tunneling();
                    }
                })
            }
            else {

                this.afterExecuteQuery(messages);

                var tree = this.getSelectedTree();
                tree.fireEvent('reloadTree', node);
            }

        }, this))();
    },

    afterExecuteQuery : function(messages){

        if(messages.length == 0){ return; }
        
        this.openMessage(messages);

      //   var tree = this.getSelectedTree(),
      //    root = tree.getRootNode(),
      //    dbNode = null, chNode = null, category = null;

      //    Ext.Array.each(result.refresh_queue, function(queue, idx){

      //        if(queue.db){

      //            dbNode = root.findChild('text', queue.db);
      //        }
      //        else {

      //            dbNode = this.getParentNode(this.getSelectedNode(), 1, true);
      //        }

      //        if(!dbNode){ return; }

      //        tree.selModel.select(dbNode);

      //        category = queue.category.charAt(0).toUpperCase();
            // category = category + queue.category.toLowerCase().substr(1) + 's';
            // chNode = dbNode.findChild('text', category);

            // if(queue.mode == 'CREATE'){

            //  chNode.appendChild([{
      //               text : queue.name,
      //               leaf : true
      //           }]);
            // }
            // else if(queue.mode == 'DROP'){

            //  chNode = chNode.findChild('text', queue.name);
            //  chNode.remove();
            // }
            // else if(queue.mode == 'ALTER'){

            // }

      //    }, this);
    },

    getParsedQuery : function(){

        var queries = [];

        var editor = this.getActiveEditor();

        if(!editor){ return queries; }

        var parser = Ext.create('Planche.lib.QueryParser', this.getAPIS());

        if(editor.somethingSelected()){

            return parser.parse(editor.getSelection());
        }
        else {
        
            var cursor = editor.getCursor();

            queries = parser.parse(editor.getValue());
            var tmp = [];
            Ext.Array.each(queries, function(query, idx){

                if(tmp.length > 0) return;

                if(cursor.line <= query.eline[0] && cursor.ch <= query.eline[1]){

                    tmp.push(query);
                }
            });
            return tmp;
        }
    },



    openTable : function(node){

        var tab = this.getActiveTableDataTab();
        var db = this.getParentNode(node);

        var parser = Ext.create('Planche.lib.QueryParser', this.getAPIS());
        var queries = parser.parse(this.getAPIS().getQuery('OPEN_TABLE', db, node.data.text));

        var query = queries[0];

        this.tunneling({
            db : db,
            query : query.getSQL(),
            node : node,
            tab : tab,
            success : function(config, response){

                var tab = this.getActiveTableDataTab();
                Ext.apply(tab, {
                    loadedTable : node.data.text,
                });
                tab.removeAll();
                var grid = this.initQueryResult({ openTable : true }, db, query, response);

                tab.show();
                tab.add(grid);
            }
        });
    },

    makeRecords : function(fields, records){

        var tmp = [];
        Ext.Array.each(records, function(row, ridx){

            var record = {};
            Ext.Array.each(fields, function(col, cidx){

                record[col.name] = row[cidx];
            });
            tmp.push(record);
        });

        return tmp;
    },

    initQueryResult : function(config, db, query, response){

        config.tab = config.tab === true || true;
        
        var scheme = response.fields, records = response.records,
            columns = [], fields = [], grid;

        var loadGridRecord = Ext.Function.bind(function(cmd){

            if(typeof cmd == 'undefined'){ cmd = ''; }
    
            var textRows = grid.down('text[text=Total]').next();
            var textRefreshPerSec = grid.down('text[text=Refresh Per Sec]').next();

            var refreshPerSec = parseFloat(textRefreshPerSec.getValue());

            textRows.setText('0');
            
            this.getActiveConnectTab().setLoading(true);

            this.tunneling({
                db : db,
                query : query['get'+cmd+'SQL'](),
                success : function(config, response){

                    var data = this.makeRecords(scheme, response.records);              
                    grid.store.loadData(data);
                    this.getActiveConnectTab().setLoading(false);

                    if(refreshPerSec > 0){

                        setTimeout(loadGridRecord, refreshPerSec * 1000);
                    }
                }
            });

        }, this);

        var updateToolbar = function(){

            var textfield = grid.query('textfield'), btnPrev = grid.down('button[text=Previous]'), 
                btnNext = grid.down('button[text=Next]'), textRows = grid.down('text[text=Total]').next();

            btnNext.setDisabled(grid.store.data.length < query.end);
            btnPrev.setDisabled(1 > query.start);

            textfield[0].setValue(query.start);
            textfield[1].setValue(query.end);

            textRows.setText(grid.store.data.length);
        };

        var colObjs = {};

        Ext.Array.each(scheme, function(col, idx){

            colObjs[col.name] = Ext.create('Ext.grid.column.Column',{
                text: col.name,
                dataIndex: col.name,
                listeners : {
                    scope : this,
                    dblclick :function(view, el, ridx, cidx, event, data){

                        if(['blob', 'var_string'].indexOf(col.type) > -1){

                            this.openWindow('table.EditTextColumn', data.get(col.name));
                        }
                    }
                },
                hideable : false,
                menuDisabled: true,
                draggable: false,
                groupable: false,
                renderer : 'htmlEncode'
            });

            columns.push(colObjs[col.name]);

            fields.push(col.name);

        }, this);

        var storeConfig = {
            fields: fields,
            autoLoad : false,
            pageSize: 10,
            data : this.makeRecords(scheme, records),
            remoteSort: true,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            }
        };

        var orderColumn    = null,
            orderColumnDir = 'ASC';

        if(config.openTable){

            Ext.apply(storeConfig, {
                sort : function(params){

                    if(orderColumn != params.property){

                        if(orderColumn != null){

                            var column = colObjs[orderColumn];
                                column.removeCls('x-column-header-sort-DESC');
                                column.removeCls('x-column-header-sort-ASC');
                        }

                        orderColumnDir = orderColumn == null ? 'DESC' : 'ASC';
                        orderColumn = params.property;
                    }
                    else {

                        orderColumnDir = orderColumnDir == 'ASC' ? 'DESC' : 'ASC';
                    }

                    query.setOrderBy(orderColumn, orderColumnDir);

                    loadGridRecord();
                }
            });
        }
        
        var grid = Ext.create('Ext.grid.Panel', Ext.Object.merge({
            xtype   : 'grid',
            border  : true,
            flex    : 1,
            columnLines: true,
            selModel : {
                selType : 'checkboxmodel'
            },
            viewConfig: { 
                emptyText : 'There are no items to show in this view.' 
            },
            plugins: {
                ptype: 'bufferedrenderer'
            },
            tbar: [
                { xtype: 'button', text: 'Add', disabled: true, cls : 'btn', scope: this, handler : function(btn){

                }},
                { xtype: 'button', text: 'Save', disabled: true, cls : 'btn', scope: this, handler : function(btn){

                }},
                { xtype: 'button', text: 'Del', disabled: true, cls : 'btn', scope: this, handler : function(btn){

                }},
                { xtype: 'tbseparator', margin : '0 5 0 5'},
                { xtype: 'button', text: 'Previous', cls : 'btn', disalbed : true, scope: this, handler : function(btn){

                    loadGridRecord('PrevRecordSet');
                }},
                { xtype: 'textfield', value: query.start, scope: this, listeners : {
                    specialkey: function (field, el) {

                        if (el.getKey() == Ext.EventObject.ENTER){
                            
                            query.start = parseInt(field.getValue(), 10);
                            loadGridRecord();
                        }
                    }
                }},
                { xtype: 'button', text: 'Next', cls : 'btn', disalbed : true, scope: this, handler : function(btn){

                    loadGridRecord('NextRecordSet');
                }},
                { xtype: 'text', text: 'Size', margin : '0 0 0 5' },
                { xtype: 'textfield', value: query.end, scope: this, width : 80, margin : '0 0 0 5', listeners : {
                    specialkey: function (field, el) {

                        if (el.getKey() == Ext.EventObject.ENTER){

                            query.end = parseInt(field.getValue(), 10);
                            loadGridRecord();
                        }
                    }
                }},
                { xtype: 'tbseparator', margin : '0 5 0 5'},
                { xtype: 'text',  text : 'Refresh Per Sec'},
                { xtype: 'textfield', value: 0, scope: this, width : 40, margin : '0 0 0 5', listeners : {
                    specialkey: function (field, el) {

                        if (el.getKey() == Ext.EventObject.ENTER){

                            loadGridRecord();
                        }
                    }
                }},
                { xtype: 'button', text: 'Refresh', cls : 'btn', scope: this, margin : '0 0 0 5', handler : function(btn){

                    loadGridRecord();
                }},
                { xtype: 'button', text: 'Stop', cls : 'btn', scope: this, margin : '0 0 0 5', handler : function(btn){

                    var textRefreshPerSec = grid.down('text[text=Refresh Per Sec]').next();

                    textRefreshPerSec.setValue(0);
                }},
                { xtype: 'tbseparator', margin : '0 5 0 5'},
                { xtype: 'button', text: 'Tokens', cls : 'btn', scope: this, handler : function(btn){

                    this.openTokenPanel(query.getTokens());
                }}
            ],
            fbar : [
                { xtype: 'text', text: 'Total' },
                { xtype: 'text', text: '0', width : 50, rtl: true },
                { xtype: 'text', text: 'Rows' }
            ],
            remoteSort: true,
            store   : Ext.create('Ext.data.Store', storeConfig),
            columns : columns
        }, config));
        
        grid.store.on('datachanged', function(){

            updateToolbar();
        });

        grid.on('sortchange', function(){

            if(!orderColumn) return;
            
            setTimeout(function(){

                var column = colObjs[orderColumn];

                if(orderColumnDir == 'ASC'){

                    column.removeCls('x-column-header-sort-DESC');
                    column.addCls('x-column-header-sort-ASC');
                }
                else {

                    column.removeCls('x-column-header-sort-ASC');
                    column.addCls('x-column-header-sort-DESC');
                }
            }, 100);
        });

        updateToolbar();
        return grid;
    },

    showMessage : function(msg){

        Ext.Msg.alert('Message', msg);
    },

    generateErrorMessage : function(query, message){

        return query + '<span class=\'query_err\'>▶ '+message+'</span>';
    },

    tokenize : function(){

        var editor = this.getActiveEditor();

        if(!editor){ return; }
        if(!editor.somethingSelected()){ 

            this.showMessage('Query is not selected.');
            return; 
        }

        var queries = editor.getSelection(),
            queries = this.parseQuery(queries);

        var tokens = [];
        Ext.Array.each(queries, function(query, idx){

            Ext.Array.each(query.getTokens(), function(token, idx){
                
                tokens.push(token);
            });
        });

        this.openTokenPanel(tokens);        
    }
});
