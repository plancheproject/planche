Ext.namespace('Planche');
//set up config path for your app

Ext.application({
	appFolder	: '.',
	name		: 'Planche',
	history     : [],
	launch		: function() {

		var includes = ['Planche.lib.Window', 'Planche.lib.Query', 'Planche.lib.QueryParser'];

		var loading;
		(loading = Ext.Function.bind(function(){

			var file = includes.shift();
			if(file) {

				 Ext.require(file, function(){

				 	loading();
				 }, this);
			}
			else {

		        this.initLayout();
			}
		}, this))();
    },

    initLayout : function(){

        Ext.create('Ext.container.Viewport', {
			renderTo	: Ext.getBody(),
			style		: { "background" : "#E0E0E0" },
			layout		: 'vbox',
			padding		: 5,
			items		: [
            	this.initTopMenu(),
            	this.initToolBar(),
            	this.initMainTab(),
            	//this.initFooter(),
            	this.initContextMenu()
            ]
        });
       
        this.initKeyMap();
    },

    initTopMenu : function(){

    	var menus = ['File', 'Edit', 'Favorites', 'Database', 'Table', 'Other', 'Tools'];

        return {
			xtype		: 'toolbar',
			id			: 'top-menu',
			margin		: '0px 0px 2px 0px',
			defaults	: {
                xtype: 'splitbutton',
                split: false,
                scope: this,                
                handler : function(btn){

                	Ext.applyIf(btn, { custom : false });

                	if(btn.custom == true){ return; }

                	var id = 'menu.'+btn.text;
			    	Ext.require('Planche.controller.'+id, function(){

				        var ctrl = this.getController(id, btn);
				        ctrl.show(btn);
				        
			    	}, this);
                }
            },
            items : function(){

            	var tmp = [];
            	Ext.Array.each(menus, function(name, idx){

            		tmp.push({ text : name, menu : Ext.create('Ext.menu.Menu') });
            	});

            	return tmp;
            }(),
			height	: 30,
			width	: '100%'
        };
    },

	initToolBar : function(){

        return {
			xtype		: 'toolbar',
			id			: 'tool-bar',
			width		: '100%',
			padding		: 3,
			margin		: '0px 0px 1px 0px',
			defaults	:{
				xtype			: 'button',
				allowDepress	: false,
				scale			: 'medium',
				tooltipType		: 'title',
				scope			: this
            },
            items : [
                {
					icon	: 'images/new_database.png',
					tooltip	: 'Create a new connection(ALT+N)',
					handler : this.openConnPanel
                },
                {
					icon	: 'images/new_query.png',
					tooltip	: 'New query editor(ALT+T)',
					disabled : true,
					handler : this.openQueryTab
                },
                {
					icon	: 'images/icon_play24x24.png',
					tooltip	: 'Query Execution(F9)',
					disabled : true,
					handler : this.executeQuery
                },
                {
					icon	: 'images/icon_user24x24.png',
					tooltip	: 'User Manager(ALT+U)',
					disabled : true,
					handler : this.openUserPanel
                }
            ]
        };
    },

    initMainTab : function(){

    	//메인탭에 커넥션별 탭을 구성한다.정주원 
        return {
			id		: 'main-tab',
			xtype	: 'tabpanel',
			flex	: 1,
			width	: '100%',
			height	: '100%',
			border	: false,
			margin	: '0px 0px 5px 0px'
        };
    },

    getToolBar : function(){

    	return Ext.getCmp('tool-bar');
    },

    getMainTab : function(){

    	return Ext.getCmp('main-tab');
    },

    getActiveMainTab : function(){

    	var mainTab = this.getMainTab();
    	return mainTab.getActiveTab();
    },

    getSubTab : function(){
    	try {
    		return this.getActiveMainTab().down("tabpanel");
	    }
    	catch(e){
    		return null;
    	}
    },

    getActiveSubTab : function(){

    	try {
    		return this.getSubTab().getActiveTab();
    	}
    	catch(e){
    		return null;
    	}
    },

    getActiveResultTabPanel : function(){

    	try {

    		return this.getActiveSubTab().down('tabpanel');
    	}
    	catch(e){

    		return null;
    	}
    },	    

    getActiveEditor : function(){

    	try {
    		return this.getActiveSubTab().down('component').getEditor();
    	}
    	catch(e){
    		return null;
    	}
    },

	getActiveTableDataTab : function(){

    	try {
    		return this.getActiveSubTab().down("[title='Table Data']");
    	}
    	catch(e){
    		return null;
    	}
	},

	getActiveInfo : function(){

    	try {
    		return this.getActiveSubTab().down("[title='Info']");
    	}
    	catch(e){
    		return null;
    	}
	},

	getActiveHistory : function(){

    	try {
    		return this.getActiveSubTab().down("[title='History']").getEditor();
    	}
    	catch(e){
    		return null;
    	}
	},

	getActiveMessage : function(){

    	try {
    		return this.getActiveSubTab().down("[title='Messages']");
    	}
    	catch(e){
    		return null;
    	}
	},

	getEngine : function(){

		return this.getActiveMainTab().config.connectInfo.engine;
	},

    initConnectTab : function(config){

		var task = new Ext.util.DelayedTask();
    	var main = this.getMainTab();
    	var tab = Ext.create('Ext.panel.Panel', {
			layout		: 'border',
			title		: config.host_name,
			border		: false,
			closable	: true,
			width		: '100%',
			height		: 30,
			style		: { "background" : "#E0E0E0" },
			padding		: '5px 0px 0px 0px',
			items		: [
           		this.initSchemeTree(config.host),
           		this.initSubTab()
           	],
			config		: {
				connectInfo: {
					host_name		: config.host_name, 
					http_tunneling	: config.http_tunneling,
					host			: config.host,
					user			: config.user,
					pass			: config.pass,
					charset			: config.charset,
					port			: config.port,
					engine 			: config.engine
				}
			},
           	listeners 	: {
           		scope : this,
           		boxready : function(tab){

           			task.delay(100, function(tab){

				    	var tree = tab.down("treepanel");
				    	var node = tree.getRootNode();
				    	tree.getSelectionModel().select(node);

				    	this.loadTree(node);

					}, this, [tab]);

        			main.setActiveTab(tab);
        			this.initQueryTab('Query', false);

        			this.checkToolbar();
           		},
           		activate : function(tab){

           			this.checkToolbar();
           		},
           		destroy : function(tab){
					
					this.checkToolbar();
           		}
           	}
		});

    	main.add(tab);
    	main.setActiveTab(tab);


		return tab;
    },

  	closeActiveConnectionTab : function(){

  		var tab = this.getActiveMainTab();
  		if(!tab) return;

  		tab.destroy();
  	},

    initSchemeTree : function(host){

        return {
			xtype	: 'treepanel',
			width	: 200,
			height	: '100%',
			region	: 'west',
			split	: true,
			store	: Ext.create('Ext.data.TreeStore', {
			    root: {
			    	text : 'root@'+host,
			        expanded: true
			    }
			}),
           	listeners : {
           		scope : this,
           		beforeitemexpand : this.expandTree,
           		select : function(view){

					var treeview = view.views[0];				       	
			        var tree = treeview.up("treepanel");
           			this.setSelectedTree(tree);
           		},
		    	show : function(tree){

		    		this.setSelectedTree(tree);			    		
		    	},
	           	boxready : function(tree){

	           		var sel = this.getSelectedTree();
	           		if(!sel) Planche.selectedTree = tree;
	           	}
           	}
        };
    },

    initSubTab : function(){

        return {
			xtype	: 'tabpanel',
			flex	: 1,
			region	: 'center',
			width	: '100%',
			height	: '100%',
			border	: false
        };
    },

    initQueryTab : function(name, closable){

    	var closable = closable !== false;
		var tab = Ext.create('Ext.container.Container', {
			layout		: 'border',
			icon 		: 'images/icon_document_add.png',
			title		: name,
			border		: false,
			closable	: closable,	
			width		: '100%',
			flex		: 1,
			items : [
				this.initQueryEditor(),
				this.initResultTabPanel(),
			]
		});
		var subTabPanel = this.getSubTab();
		if(!subTabPanel){ return; }
		subTabPanel.add(tab);
		subTabPanel.setActiveTab(tab);
    },

    initQueryEditor : function(){
		    	
		return {
			xtype		: 'component',
			region		: 'center',
			header		: false,
			border		: true,
			width		: '100%',
			flex		: 1,
			bodyPadding	: 5,
		    html : '<textarea></textarea>',
			listeners : {
				boxready : function(editor, width, height){

	                textarea = editor.getEl().query('textarea')[0];

	                Ext.apply(this, {
	                	editor : CodeMirror.fromTextArea(textarea, {
		                    mode: 'text/x-mysql',
		                    indentWithTabs: true,
		                    smartIndent: true,
		                    lineNumbers: true,
		                    matchBrackets : true,
		                    autofocus: true
		                }),
	                	getEditor : function(){
	                		return this.editor;
	                	}
	                });
				},
				resize : function(editor, width, height){

					this.editor.setSize(width, height);
				}
			}
		};
    },

    initResultTabPanel : function(){
    	
		return {
			xtype	: 'tabpanel',
			layout  : 'fit',
			region	: 'south',
			split	: true,
			border	: true,
			width	: '100%',
			height	: 300,
		    items: [
		    	this.initMessages(),
		    	this.initTableData(),
		    	this.initInfo(),
		    	this.initHistory()
		    ]
		};
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

    initQueryResult : function(params){

    	params.tab = params.tab === true || true;
    	
    	var result = params.response;
    	var queryObj = params.queryObj, scheme = result.fields, records = result.records,
    		columns = [], fields = [], grid;

        var loadRecord = Ext.Function.bind(function(cmd){

        	if(typeof cmd == 'undefined'){ cmd = ''; }
	
        	var textRows = grid.down('text[text=Total]').next();

        	textRows.setText('0');
        	
        	grid.setLoading(true);

	    	this.tunneling({
	    		db : params.db,
	    		query : queryObj['get'+cmd+'SQL'](),
	    		success : function(config, response){

			        var data = this.makeRecords(scheme, response.records);				
	    			grid.store.loadData(data);
	    			grid.setLoading(false);
	    		}
	    	});

        }, this);

        var updateToolbar = function(){

			var textfield = grid.query('textfield'),
        		btnPrev = grid.down('button[text=Previous]'), btnNext = grid.down('button[text=Next]');
        		textRows = grid.down('text[text=Total]').next();

			btnNext.setDisabled(grid.store.data.length < queryObj.end);
			btnPrev.setDisabled(1 > queryObj.start);

			textfield[0].setValue(queryObj.start);
			textfield[1].setValue(queryObj.end);

			textRows.setText(grid.store.data.length);

        };

        Ext.Array.each(scheme, function(col, idx){

            columns.push({
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
                groupable: false
            });
            fields.push(col.name);
        }, this);

		var grid = Ext.create('Ext.grid.Panel', Ext.Object.merge({
			xtype	: 'grid',
			border	: true,
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
              	{ xtype: 'button', text: 'Add', cls : 'btn', scope: this, handler : function(btn){

				}},
              	{ xtype: 'button', text: 'Save', cls : 'btn', scope: this, handler : function(btn){

				}},
              	{ xtype: 'button', text: 'Del', cls : 'btn', scope: this, handler : function(btn){


				}},
				{ xtype: 'tbseparator', margin : '0 5 0 5'},
				{ xtype: 'button', text: 'Previous', cls : 'btn', disalbed : true, scope: this, handler : function(btn){

			    	loadRecord('PrevRecordSet');
				}},
				{ xtype: 'textfield', value: queryObj.start, scope: this, listeners : {
					specialkey: function (field, el) {

						if (el.getKey() == Ext.EventObject.ENTER){
							
							queryObj.start = parseInt(field.getValue(), 10);
							loadRecord();
						}
              		}
              	}},
				{ xtype: 'button', text: 'Next', cls : 'btn', disalbed : true, scope: this, handler : function(btn){

					loadRecord('NextRecordSet');
				}},
				{ xtype: 'text', text: 'Size', margin : '0 0 0 5' },
				{ xtype: 'textfield', value: queryObj.end, scope: this, width : 80, margin : '0 0 0 5', listeners : {
					specialkey: function (field, el) {

						if (el.getKey() == Ext.EventObject.ENTER){

							queryObj.end = parseInt(field.getValue(), 10);
							loadRecord();
						}
              		}
              	}},
              	{ xtype: 'tbseparator', margin : '0 5 0 5'},
				{ xtype: 'text',  text : 'Refresh Per Sec'},
				{ xtype: 'textfield', value: 0, scope: this, width : 40, margin : '0 0 0 5', listeners : {
					specialkey: function (field, el) {

						if (el.getKey() == Ext.EventObject.ENTER){
							
							queryObj.start = parseInt(field.getValue(), 10);
							
						}
              		}
              	}},
              	{ xtype: 'button', text: 'Refresh', cls : 'btn', scope: this, margin : '0 0 0 5', handler : function(btn){

					loadRecord();
				}}
			],
			fbar : [
				{ xtype: 'text', text: 'Total' },
				{ xtype: 'text', text: '0', width : 50, rtl: true },
				{ xtype: 'text', text: 'Rows' }
			],
			store	: Ext.create('Ext.data.Store', {
			    fields: fields,
			    autoLoad : false,
			    pageSize: 10,
			    data : this.makeRecords(scheme, records),
			    proxy: {
			        type: 'memory',
			        reader: {
			            type: 'json'
			        }
			    }
			}),
		    columns : columns
		}, params));
		
		grid.store.on('datachanged', updateToolbar);

		// grid.on('load', function(){

		// 	console.log('load');
		// });
		updateToolbar();
		return grid;
    },

    initTableData : function(){
    	
		return {
			xtype	: 'container',
			layout: 'fit',
			split	: true,
			icon	: 'images/icon_table.png',
			title	: 'Table Data',
			border	: true,
			flex	: 1,
		    listeners : {
		    	scope : this,
		    	show : function(grid){

		    		var node = this.getSelectedNode();
		    		var tree = this.getSelectedTree();

		    		if(!node){ return; }

			        if(node.data.depth == 3 && (this.getParentNode(node, 2) == 'Tables' || this.getParentNode(node, 2) == 'Views')){

        				var tab = this.getActiveTableDataTab();
        				if(tab.loadedTable == node.data.text){ return; }
			        	this.openTable(node);
			        }
		    	}
		    }
		};
    },

    initMessages : function(){
    	
		return {
			xtype	: 'container',
			icon    : 'images/icon_message.png',
			title   : 'Messages',
			split	: true,
			border	: false,
			padding : '10 10 10 10',
			flex	: 1
		};
    },

    initInfo : function(){
    	
		return {
			xtype	: 'container',
			icon    : 'images/icon_info.png',
			title   : 'Info',
			split	: true,
			border	: false,
			flex	: 1,
			padding : '10 10 10 10',
			autoScroll: true,
		    listeners : {
		    	scope : this,
		    	show : function(grid){

		    		this.openInfo(this.getSelectedNode());
		    	}
		    }
		};
    },

    initHistory : function(){

		return {
			xtype	: 'component',
			icon    : 'images/icon_history.png',
			title   : 'History',
			split	: true,
			border	: false,
			flex	: 1,
			html    : '<textarea></textarea>',
			listeners : {
				scope : this,
				boxready : function(editor, width, height){

	                textarea = editor.getEl().query('textarea')[0];

	                Ext.apply(editor, {
	                	editor : CodeMirror.fromTextArea(textarea, {
		                    mode: 'text/x-mysql',
		                    indentWithTabs: true,
		                    smartIndent: true,
		                    matchBrackets : true,
		                    autofocus: true,
		                    readOnly : true,
		                    lineNumbers : false,
		                    showCursorWhenSelecting : false
		                }),
	                	getEditor : function(){
	                		return this.editor;
	                	}
	                });

					var task = new Ext.util.DelayedTask(function(){

					    editor.getEditor().setValue(this.history.join("\n"));

					}, this);

					task.delay(500);
				},
				resize : function(editor, width, height){

					editor.getEditor().setSize(width, height);
				},
				activate : function(editor){

					try{

						if(editor.getEditor()){

							editor.getEditor().setValue(this.history.join("\n"));
						}
					}
					catch(e){

					}

				}
			}
		};
    },

    initFooter : function(){

        return {
			id		: 'footer',
			xtype	: 'panel',
			border	: true,
			width	: '100%',
			height	: 30,
			html	: 'footer'
        };
    },

    openConnPanel : function(){

		this.openWindow('connection.Connect');
    },

    openUserPanel : function(){

    	var node = this.getSelectedNode();
    	var db = this.getParentNode(node);
    	this.tunneling({
    		db : db,
    		query : this.getEngine().getQuery('SELECT_USER', db),
    		success : function(config, response){

    			this.openWindow('user.Users', db, node.data.text, response);
    		}
    	});
    },

    openQuickPanel : function(records){

    	var db = this.getParentNode(this.getSelectedNode());
    	this.tunneling({
    		db : db,
    		query : this.getEngine().getQuery('SHOW_TABLE_STATUS', db),
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

	openReorderColumns : function(node){

    	var db = this.getParentNode(node);
    	this.tunneling({
    		db : db,
    		query : this.getEngine().getQuery('SHOW_FULL_FIELDS', db, node.data.text),
    		success : function(config, response){

    			this.openWindow('table.ReorderColumns', db, node.data.text, response);
    		}
    	});
	},

	openAdvancedProperties : function(node){

    	var db = this.getParentNode(node);
    	this.tunneling({
    		db : db,
    		query : this.getEngine().getQuery('SHOW_ADVANCED_PROPERTIES', db, node.data.text),
    		success : function(config, response){

    			this.openWindow('table.AdvancedProperties', db, node.data.text, response);
    		}
    	});
	},

    openQueryTab : function(){

    	this.initQueryTab('Query');
    },

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

    renameTable : function(node){

		var db = this.getParentNode(node);
		var table = node.data.text;
		Ext.Msg.prompt('Rename Table \''+table+'\' in \''+db+'\'', 'Please enter new table name:', function(btn, text){

		    if (btn == 'ok'){

	        	this.tunneling({
	        		db : db,
	        		query : 'RENAME TABLE `'+db+'`.`'+table+'` TO `'+db+'`.`'+text+'`',
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
	        		query : 'TRUNCATE TABLE `'+db+'`.`'+table+'`',
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

    expandTree : function(node){

    	if(node.childNodes.length > 0){ return; }
		this.loadTree(node);
	},

	loadTree : function(node){

		this['load'+(node.isRoot() ? 'Databases' : node.data.text.replace(/\s/gi, ''))](node);
	},

	reloadTree : function(node){

		node.removeAll();
		this.loadTree(node);
	},

	getParentNode : function(n, depth, return_node){

		if(typeof depth == "undefined"){ depth = 1; }
		if(!n.parentNode){ return null; }
		if(!n.data.depth == depth){ return n.data.text; }

        while(n.parentNode && n.parentNode.data.depth >= depth) {

            n = n.parentNode;
        }

        if(return_node) {

        	return n;
        }
        else {
        	
			return n.data.text;
		}
	},

	loadDatabaseContextMenu : function(){

		return [{
    		text: 'Create Database',
    		disabled : true,
    		handler : function(){

    		}
		},{
    		text: 'Alter Database',
    		disabled : true
		},{
    		text: 'Drop Database',
    		disabled : true
		},{
    		text: 'Truncate Database',
    		disabled : true
		},{
    		text: 'Empty Database',
    		disabled : true
		}];
	},

	loadTablesContextMenu : function(){

        return [{
     		text: 'Create Table',
    		handler : function(){

    			this.openCreateTableWindow();
    		}
		},{
    		text: 'Copy Table(s) To Differnt Host/Database',
    		disabled : true,
    		handler : function(){

    		}
		}];
	},

	loadTableContextMenu : function(){

	    return [{
    		text: 'Paste SQL Statement',
	        defaults : {
	            scope : this
	        },
    		listeners : {
    			scope : this,
    			activate : function(menu){

    				var subTab = this.getActiveSubTab();
    				Ext.Object.each(menu.menu.items.items, function(idx, obj){ 
    					obj[subTab ? 'enable' : 'disable'](); 
    				});
    			}
    		},
    		menu : [{
        		text: 'INSERT INTO &lt;Table Name&gt;..',
        		scope : this,
        		handler : function(){

					var node = this.getSelectedNode();
					console.log('start');
        			this.pasteSQLStatement('insert', node);
        			console.log('end');

        		}
			},{
        		text: 'UPDATE &lt;Table Name&gt; SET..',
        		scope : this,
        		handler : function(){

					var node = this.getSelectedNode();
			        this.pasteSQLStatement('update', node);
        		}
			},{
        		text: 'DELETE FROM &lt;Table Name&gt;..',
        		scope : this,
        		handler : function(){

					var node = this.getSelectedNode();
			        this.pasteSQLStatement('delete', node);
        		}
			},{
        		text: 'SELECT &lt;col-1&gt;..&lt;col-n&gt; FROM &lt;Table Name&gt;',
        		scope : this,
        		handler : function(){

					var node = this.getSelectedNode();
			        this.pasteSQLStatement('select', node);
        		}
			}]
		},{
    		text: 'Copy Table(s) To Differnt Host/Database',
    		disabled : true,
    		handler : function(){

    		}
		},{
			xtype: 'menuseparator'
		},{
    		text: 'Open Table',
    		handler : function(){

        		this.openTable(this.getSelectedNode());
    		}
		},{
    		text: 'Create Table',
    		handler : function(){

    			this.openCreateTableWindow();
    		}
		},{
    		text: 'Alter Table',
    		scope : this,
    		handler : function(){
    			
    			var node = this.getSelectedNode();
    			this.openAlterTableWindow(node);
    		}
		},{
    		text: 'More Table Operations',
    		menu : [{
        		text: 'Rename Table',
        		scope : this,
        		handler : function(){

    				var node = this.getSelectedNode();
        			this.renameTable(node);
        		}
			},{
        		text: 'Truncate Table',
        		scope : this,
        		handler : function(){

        			var node = this.getSelectedNode();
        			this.truncateTable(node);
        		}
			},{
        		text: 'Drop Table From Database',
        		scope : this,
        		handler : function(){

        			var node = this.getSelectedNode();
        			this.dropTable(node);
        		}
			},{
        		text: 'Reorder Column(s)',
        		scope : this,
        		handler : function(){

        			var node = this.getSelectedNode();
					this.openReorderColumns(node);
        		}
			},{
        		text: 'Duplicate Table Structure/Data',
        		scope : this,
        		disabled : true,
        		handler : function(){

        		}
			},{
        		text: 'View Advanced Properties',
        		scope : this,
        		handler : function(){

        			var node = this.getSelectedNode();
        			this.openAdvancedProperties(node);
        		}
			},{
        		text: 'Change Table To Type',
        		menu : [
					{
						scope : this,
						text : 'MYISAM', 
						handler : function(btn){
							this.changeTableToType(btn.text);
						}
					},
					{
						scope : this,
						text : 'MRG_MYISAM', 
						handler : function(btn){
							this.changeTableToType(btn.text);
						}
					},
					{
						scope : this,
						text : 'CSV', 
						handler : function(btn){
							this.changeTableToType(btn.text);
						}
					},
					{
						scope : this,
						text : 'BLACKHOLE', 
						handler : function(btn){
							this.changeTableToType(btn.text);
						}
					},
					{
						scope : this,
						text : 'MEMORY', 
						handler : function(btn){
							this.changeTableToType(btn.text);
						}
					},
					{
						scope : this,
						text : 'FEDERATED', 
						handler : function(btn){
							this.changeTableToType(btn.text);
						}
					},
					{
						scope : this,
						text : 'ARCHIVE', 
						handler : function(btn){
							this.changeTableToType(btn.text);
						}
					},
					{
						scope : this,
						text : 'INNODB', 
						handler : function(btn){
							this.changeTableToType(btn.text);
						}
					},
					{
						scope : this,
						text : 'PERFORMANCE_SCHEMA', 
						handler : function(btn){

							this.changeTableToType(btn.text);
						}
					}
        		]
			}]
		},{
			xtype: 'menuseparator'
		},{
    		text: 'Create Trigger',
    		handler : function(){

    			var node = this.getSelectedNode();
    			this.createTrigger(node);
    		}
		}];
	},

	loadViewsContextMenu : function(){

		return [{
			text: 'Create View',
			handler : function(){

				this.createView();
			}
		},
		{
			text: 'Alter View',
			disabled : true
		},
		{
			text: 'Drop View',
			disabled : true
		},
		{
			text: 'Rename View',
			disabled : true
		},
		{
			text: 'Export View',
			disabled : true
		},
		{
			text: 'Open View',
			disabled : true
		}];
	},

	loadViewContextMenu : function(){

		return [{
			text: 'Create View',
			handler : function(){

				this.createView();
			}
		},
		{
			text: 'Alter View',
			handler : function(){

				this.alterView();
			}
		},
		{
			text: 'Drop View',
			handler : function(){

			}
		},
		{
			text: 'Rename View',
			handler : function(){

			}
		},
		{
			text: 'Export View',
			handler : function(){

			}
		},
		{
			text: 'Open View',
			handler : function(){

				this.openTable(this.getSelectedNode());
			}
		}];
	},

	loadEventsContextMenu : function(){

		return [{
			text: 'Create Event',
			handler : function(){

				this.createEvent();
			}
		},
		{
			text: 'Alter Event',
			disabled : true
		},
		{
			text: 'Drop Event',
			disabled : true
		},
		{
			text: 'Rename Event',
			disabled : true
		}];
	},

	loadEventContextMenu : function(){

		return [{
			text: 'Create Event',
			handler : function(){

				this.createEvent();
			}
		},
		{
			text: 'Alter Event',
			handler : function(){

			}
		},
		{
			text: 'Drop Event',
			handler : function(){

			}
		},
		{
			text: 'Rename Event',
			handler : function(){

			}
		}];
	},

	loadTriggersContextMenu : function(){

		return [{
			text: 'Create Trigger',
			handler : function(){

				this.createTrigger();
			}
		},
		{
			text: 'Alter Trigger',
			disabled : true
		},
		{
			text: 'Drop Trigger',
			disabled : true
		},
		{
			text: 'Rename Trigger',
			disabled : true
		}];
	},

	loadTriggerContextMenu : function(){

		return [{
			text: 'Create Trigger',
			handler : function(){

				this.createTrigger();
			}
		},
		{
			text: 'Alter Trigger',
			handler : function(){

			}
		},
		{
			text: 'Drop Trigger',
			handler : function(){

			}
		},
		{
			text: 'Rename Trigger',
			handler : function(){

			}
		}];
	},

	loadFunctionsContextMenu : function(){

		return [{
			text: 'Create Function',
			handler : function(){

				this.createFunction();
			}
		},
		{
			text: 'Alter Function',
			disabled : true
		},
		{
			text: 'Drop Function',
			disabled : true
		}];
	},

	loadFunctionContextMenu : function(){

		return [{
			text: 'Create Function',
			handler : function(){

				this.createFunction();
			}
		},
		{
			text: 'Alter Function',
			handler : function(){

			}
		},
		{
			text: 'Drop Function',
			handler : function(){

			}
		}];
	},

	loadProceduresContextMenu : function(){

		return [{
			text: 'Create Procedure',
			handler : function(){

				this.createProcedure();
			}
		},
		{
			text: 'Alter Procedure',
			disabled : true
		},
		{
			text: 'Drop Procedure',
			disabled : true
		}];
	},

	loadProcedureContextMenu : function(){

		return [{
			text: 'Create Procedure',
			handler : function(){

				this.createProcedure();
			}
		},
		{
			text: 'Alter Procedure',
			handler : function(){

			}
		},
		{
			text: 'Drop Procedure',
			handler : function(){

			}
		}];
	},

	initContextMenu : function(){


	    this.contextMenu = Ext.create('Ext.menu.Menu', {
	        margin: '0 0 10 0',
	        defaults : {
	            scope : this
	        },
	        items: []
	    });

	    //서버트리의 이벤트를 잡아 내서 node위에서 right click을 했을 경우만 
	    //context메뉴를 보여준다.
	    Ext.getBody().on('contextmenu', function(e){ 

			e.preventDefault();

	        var tr = null;
	        var n = e.target;
	        while(n = n.parentNode){

	        	if(n.getAttribute){

	        		if(tr == null && n.getAttribute('data-boundview')){
	        			tr = n;
	        		}

	        		// if(panel == null){

	        		// 	cls = n.getAttribute('class');
	        		// 	if(cls){

			        // 		cls = cls.split(/\s+/);
			        // 		if(Ext.Array.contains(cls, 'x-panel')){

			        // 			panel = n;
			        // 		}
		        	// 	}
	        		// }
	        	}
	        }

	        if(!tr){ return; }

			var node = this.getSelectedNode();
	        var data = node.getData();
	        var cmd;
	        if(data.depth == 0){

	        	cmd = 'Root';
	        }		        
	        else if(data.depth == 1){

	        	cmd = 'Database';
	        }
	        else if(data.depth == 3 || data.depth == 5){

	        	cmd = node.parentNode.getData().text;
	        	cmd = cmd.substring(0, cmd.length - 1).replace(/\s/gi, '');
	        }
	        else {

	        	cmd = data.text.replace(/\s/gi, '');
	        }
	        
	        if(!this['load'+cmd+'ContextMenu']){ return; }

	        this.contextMenu.removeAll();
	        this.contextMenu.add(this['load'+cmd+'ContextMenu']());
	        this.contextMenu.showAt(e.getXY());

	    }, this);

		return this.contextMenu;
	},

	getSelectedTree : function(){

		return Planche.selectedTree;
	},

	getSelectedNode : function(){

		return Planche.selectedNode;
	},

	setSelectedTree : function(tree){

        Planche.selectedTree = tree;
        var node = Planche.selectedNode = tree.getSelectionModel().getSelection()[0];

        if(node.data.depth == 1){

        	var info = this.getActiveInfo();
        	if(info.isVisible()){

        		this.openInfo(node);
        	}
        }
        else if(node.data.depth == 2){

        	var info = this.getActiveInfo();
        	if(info.isVisible()){

        		this.openInfo(node);
        	}
        }
        else if(node.data.depth == 3){

        	var grid = this.getActiveTableDataTab();
        	
        	if(grid.isVisible() && (this.getParentNode(node, 2) == 'Tables' || this.getParentNode(node, 2) == 'Views')){

        		this.openTable(node)
        	}

        	var info = this.getActiveInfo();
        	if(info.isVisible()){

        		this.openInfo(node);
        	}
        }
	},

	setActiveEditorValue : function(v){

        var editor = this.getActiveEditor();
        t = editor.getValue();
        editor.setValue(t ? t + "\n" + v : v);
	},

	pushHistory : function(t, q){

		this.history.push('/* '+Ext.Date.format(new Date(), 'Y-m-d h:i:s')+' 0ms */ '+q.replace(/[\t\n]+/gi, " "));

		try {

			var editor = this.getActiveHistory();
			editor.setValue(this.history.join("\n"));
		}
		catch(e){

		}
	},

	makeTableByRecord : function(record, html){

		var html = html || [];
        html.push('<table class="x-gridview-1067-table x-grid-table" border="0" cellpadding="0" cellspacing="0" width="100%">');
        html.push('<tr class="x-grid-row x-grid-data-row">');
        Ext.Array.each(record.fields, function(col, cidx){

            html.push('<td class="x-grid-cell x-grid-td">'+col.name+'</td>');
        });
        html.push('</tr>');
        Ext.Array.each(record.records, function(row, ridx){

            html.push('<tr class="x-grid-row x-grid-data-row">');
            Ext.Array.each(record.fields, function(col, cidx){

                html.push('<td class="x-grid-cell x-grid-td">'+row[cidx]+'</td>');
            });
            html.push('</tr>');
        });
        html.push('</table>');

        return html;
	},

	executeQuery : function(){

		var editor = this.getActiveEditor();

		if(!editor){ return; }

		var parser = Ext.create('Planche.lib.QueryParser', this.getEngine());

		if(editor.somethingSelected()){

        	var queries = parser.parse(editor.getSelection());
		}
		else {
 		
        	var queries = parser.parse(editor.getValue());
		}

    	if(queries.length == 0){

			this.openMessage('No query(s) were executed. Please enter a query in the SQL window or place the cursor inside a query.');
    		return;
   	 	}

    	var cursor = editor.getCursor();

    	cursor.line;
    	cursor.ch;

    	var panel = this.getActiveMessage();
    	var dom = Ext.get(panel.getEl().query("div[id$=innerCt]"));
    	dom.setHTML('');

		var node = this.getSelectedNode();
        var db = this.getParentNode(node);
        var tabpanel = this.getActiveResultTabPanel();
        tabpanel.items.each(function(cmp, idx){ if(idx > 3) cmp.destroy() });

		var tunneling;
		var messages = [];
		(tunneling = Ext.Function.bind(function(){

			var queryObj = queries.shift();
			if(queryObj) {

	            this.tunneling({
	                db : db,
	                query : queryObj.getSQL(),
	                success : function(config, response){

	                    if(response.is_result_query == true){

		                    var grid = this.initQueryResult({
		                        response : response,
		                        icon   : 'images/icon_table.png',
		                        closable : true,
		                        db : db,
		                        queryObj : queryObj,
		                        title : 'Result'
		                    });

		                    var tabpanel = this.getActiveResultTabPanel();

		                    tabpanel.add(grid);
		                    tabpanel.setActiveTab(grid);
	                    }
	                    else {

	                        var msg = response.affected_rows+' row(s) affected<br>';
	                        msg += 'Execution Time : 00:00:00:000<br>';
	                        msg += 'Transfer Time  : 00:00:00:000<br>';
	                        msg += 'Total Time     : 00:00:00:000';
	                        messages.push(queryObj.getSQL()+'<br/><br/>'+msg);
	                    }

	                    tunneling();
	                },
	                failure : function(config, response){

	                	messages.push(queryObj.getSQL()+'<br/><br/>'+response);

	                	tunneling();
	                }
	            })
			}
			else {

				if(messages.length == 0){ return; }
		        this.openMessage(messages);
		        var tree = this.getSelectedTree();
		        var root = tree.getRootNode();
		        var dbNode = null;
		        var chNode = null;
		        var category = null;
		       	Ext.Array.each(result.refresh_queue, function(queue, idx){

		       		if(queue.db){

		       			dbNode = root.findChild('text', queue.db);
		       		}
		       		else {

		       			dbNode = this.getParentNode(this.getSelectedNode(), 1, true);
		       		}

		       		if(!dbNode){ return; }

		       		tree.selModel.select(dbNode);

		       		category = queue.category.charAt(0).toUpperCase();
					category = category + queue.category.toLowerCase().substr(1) + 's';
					chNode = dbNode.findChild('text', category);

					if(queue.mode == 'CREATE'){

						chNode.appendChild([{
			                text : queue.name,
			                leaf : true
			            }]);
					}
					else if(queue.mode == 'DROP'){

						chNode = chNode.findChild('text', queue.name);
						chNode.remove();
					}
					else if(queue.mode == 'ALTER'){

					}

		       	}, this);
			}

		}, this))();
	},

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

	checkToolbar : function(){

		var cnt = this.getMainTab().items.getCount();

		Ext.Array.each(this.getToolBar().items.getRange(1), function(obj, idx){
		    
		    obj[cnt > 0 ? 'enable' : 'disable']();
		});
	},

	loadDatabases : function(node){

	    this.tunneling({
	    	query : this.getEngine().getQuery('SHOW_DATABASE'),
			node : node,
	    	success : function(config, response){

		    	var children = [];
		    	Ext.Array.each(response.records, function(row, idx){

		    		children.push({
		    			text : row[0],
		    			icon : 'images/icon_database.png',
		    			leaf : false,
		    			children : [{
				        	text : 'Tables',
		    				leaf : false
				        }, {
				        	text : 'Views',
		    				leaf : false
				        }, {
				        	text : 'Procedures',
		    				leaf : false
				        }, {
				        	text : 'Functions',
		    				leaf : false
				        }, {
				        	text : 'Triggers',
		    				leaf : false
				        }, {
				        	text : 'Events',
		    				leaf : false
				        }]
		    		});
		    	});

		    	if(children.length == 0){ return ; }
				node.appendChild(children);
	    	},
	    	failure : function(){

	    		Ext.Msg.alert('Error', 'Can\'t connect to MySQL Server');
	    	}
		});
	},

	loadTables : function(node){

		var db = node.parentNode.data.text;
		this.tunneling({
			db : db,
			query : this.getEngine().getQuery('SHOW_TABLE_STATUS', db),
			node : node,
			success : function(config, response){

		        var children = [];
		        node.removeAll();
		        Ext.Array.each(response.records, function(row, idx){

		        	if(row[1] == 'NULL'){ return; }

		            children.push({
		                text : row[0],
		                icon : 'images/icon_table.png',
		                leaf : false,
		                children : [{
		                    text : 'Columns',
		                    leaf : false
		                }, {
		                    text : 'Indexes',
		                    leaf : false
		                }]
		            });
		        });

		        if(children.length == 0){ return ; }
		        node.appendChild(children);
			}
		});
	},

	loadViews : function(node){

		var db = this.getParentNode(node);
		this.tunneling({
			db : db,
			query : this.getEngine().getQuery('SHOW_VIEWS', db),
			node : node,
			success : function(config, response){

		        var children = [];
		        node.removeAll();
		        Ext.Array.each(response.records, function(row, idx){

		            children.push({
		                text : row[0],
		                leaf : true
		            });
		        });

		        if(children.length == 0){ return ; }
		        node.appendChild(children);
			}
		});
	},

	loadProcedures : function(node){

		var db = this.getParentNode(node);
		this.tunneling({
			db : db,
			query : this.getEngine().getQuery('SHOW_PROCEDURES', db),
			node : node,
			success : function(config, response){

		        var children = [];
		        node.removeAll();
		        Ext.Array.each(response.records, function(row, idx){

		            children.push({
		                text : row[1],
		                leaf : true
		            });
		        });

		        if(children.length == 0){ return ; }
		        node.appendChild(children);
			}
		});
	},

	loadFunctions : function(node){

		var db = this.getParentNode(node);
		this.tunneling({
			db : db,
			query : this.getEngine().getQuery('SHOW_FUNCTIONS', db),
			node : node,
			success : function(config, response){

		        var children = [];
		        node.removeAll();
		        Ext.Array.each(response.records, function(row, idx){

		            children.push({
		                text : row[1],
		                leaf : true
		            });
		        });

		        if(children.length == 0){ return ; }
		        node.appendChild(children);
			}
		});
	},

	loadTriggers : function(node){

		var db = this.getParentNode(node);
		this.tunneling({
			db : db,
			query : this.getEngine().getQuery('SHOW_TRIGGERS', db),
			node : node,
			success : function(config, response){

		        var children = [];
		        node.removeAll();
		        Ext.Array.each(response.records, function(row, idx){

		            children.push({
		                text : row[0] + ' - ' + row[1],
		                leaf : true
		            });
		        });

		        if(children.length == 0){ return ; }
		        node.appendChild(children);
			}
		});
	},

	loadEvents : function(node){

		var db = this.getParentNode(node);
		this.tunneling({
			db : db,
			query : this.getEngine().getQuery('SHOW_EVENTS', db),
			node : node,
			success : function(config, response){

		        var children = [];
		        node.removeAll();
		        Ext.Array.each(response.records, function(row, idx){

		            children.push({
		                text : row[1],
		                leaf : true
		            });
		        });

		        if(children.length == 0){ return ; }
		        node.appendChild(children);
			}
		});
	},

	loadColumns : function(node){

		var db = this.getParentNode(node);
		this.tunneling({
			db : db,
			query : 'SHOW FULL FIELDS FROM `'+db+'`.`'+node.parentNode.data.text+'` ',
			node : node,
			success : function(config, response){

		    	var children = [];
		    	node.removeAll();
		    	Ext.Array.each(response.records, function(row, idx){

		    		children.push({
		    			text : row[0]+' '+row[1],
		    			icon : 'images/icon_'+(row[4] == 'PRI' ? 'primary' : 'column') + '.png',
		    			leaf : true,
		    			qtip : row[8]
		    		});
		    	});

		    	if(children.length == 0){ return ; }
				node.appendChild(children);
			}
		});
	},

	loadIndexes : function(node){

		this.tunneling({
			db : this.getParentNode(node),
			query : 'SHOW INDEX FROM '+node.parentNode.data.text,
			node : node,
			success : function(config, response){

		        var children = [];
		        node.removeAll();
		        var groups = {};
		        Ext.Array.each(response.records, function(row, idx){

		        	groups[row[2]] = groups[row[2]] || [];
		        	groups[row[2]].push('\''+row[4]+'\'');
		        });

		        Ext.Object.each(groups, function(name, columns){

		            children.push({
		                text : name + ' ('+columns.join(',')+')',
		                icon : 'images/icon_table.png',
		                leaf : true
		            });
		        });

		        if(children.length == 0){ return ; }
		        node.appendChild(children);
			}
		});
	},

	openMessage : function(messages){

        var panel = this.getActiveMessage();
        var dom = Ext.get(panel.getEl().query("div[id$=innerCt]"));

        if(typeof messages == 'object'){

        	var message = '';
        	Ext.Array.each(messages, function(str, idx){

        		message += str+"<br/><br/>";
        	});
        	dom.setHTML(message);
        }
        else {

        	dom.setHTML(messages);
        }
        
        panel.show();
	},

	openTable : function(node){

        var tab = this.getActiveTableDataTab();
        var db = this.getParentNode(node);

        var parser = Ext.create('Planche.lib.QueryParser', this.getEngine());
        var queries = parser.parse(this.getEngine().getQuery('OPEN_TABLE', db, node.data.text));

        var queryObj = queries[0];

		this.tunneling({
			db : db,
			query : queryObj.getSQL(),
			node : node,
			tab : tab,
			success : function(config, response){

		        var tab = this.getActiveTableDataTab();
		        Ext.apply(tab, {
		            loadedTable : node.data.text,
		        });
		        tab.removeAll();
		        var grid = this.initQueryResult({
		            response : response,
		            db : db,
		            queryObj : queryObj
		        });

		        tab.show();
		        tab.add(grid);
			}
		});
	},

	openInfo : function(node){

		var cmd = ['Database', 'Tables', 'Table'][node.data.depth - 1];
		if(!cmd){ return; }
        this[['open', cmd, 'Info'].join("")](node);
	},

	openTableInfo : function(node){

		var db			= this.getParentNode(node);
		var info		= this.getActiveInfo();
		var dom			= Ext.get(info.getEl().query("div[id$=innerCt]"));
		
		var queries = {
			create	: this.getEngine().getQuery('TABLE_CREATE_INFO', db, node.data.text),
			fields	: this.getEngine().getQuery('TABLE_FIELDS_INFO', db, node.data.text),
			keys	: this.getEngine().getQuery('TABLE_KEYS_INFO', db, node.data.text)
		};

		var keys = Ext.Object.getKeys(queries);
		var responses	= {};
		var tunneling;
		(tunneling = Ext.Function.bind(function(){

			var key = keys.shift();
			if(key) {

				this.tunneling({
					db : db,
					query : queries[key],
					node : node,
					success : function(config, response){

						responses[key] = response;
						tunneling();
					}
				});
			}
			else {

		        var html = [];
		        html.push('<h3>Show Table Fields</h3>');			        
		        this.makeTableByRecord(responses.fields, html);
		        html.push('<h3>Show Table Indexes</h3>');			        
		        this.makeTableByRecord(responses.keys, html);
		        html.push('<h3>Create Table DDL</h3>');
		        html.push('<div>'+responses.create.records[0][1].replace(/\n/gi, '<br/>')+'</div>');
		        dom.setHTML(html.join(""));
			}

		}, this))();
	},

	openTablesInfo : function(node){

		var db			= this.getParentNode(node);
		var info		= this.getActiveInfo();
		var dom			= Ext.get(info.getEl().query("div[id$=innerCt]"));
		this.tunneling({
			db : db,
			query : this.getEngine().getQuery('SHOW_TABLE_STATUS', db),
			node : node,
			success : function(config, response){

		        var html = [];
		        html.push('<h1>Show Table Status</h1>');
		        this.makeTableByRecord(response, html);
		        dom.setHTML(html.join(""));
			}
		});
	},

	openDatabaseInfo : function(node){

		var db		= this.getParentNode(node);
		var info	= this.getActiveInfo();
		var dom		= Ext.get(info.getEl().query("div[id$=innerCt]"));
		var queries	= {
			tables		: this.getEngine().getQuery('SHOW_TABLE_STATUS', db),
			views		: this.getEngine().getQuery('SHOW_VIEWS', db),
			procedures	: this.getEngine().getQuery('SHOW_PROCEDURES', db),
			functions	: this.getEngine().getQuery('SHOW_FUNCTIONS', db),
			triggers	: this.getEngine().getQuery('SHOW_TRIGGERS', db),
			events		: this.getEngine().getQuery('SHOW_EVENTS', db),
			ddl			: this.getEngine().getQuery('SHOW_DATABASE_DDL', db)
		};

		var keys		= Ext.Object.getKeys(queries);
		var responses	= {};
		var tunneling;
		(tunneling = Ext.Function.bind(function(){

			var key = keys.shift();
			if(key) {

				this.tunneling({
					db : db,
					query : queries[key],
					node : node,
					success : function(config, response){

						responses[key] = response;
						tunneling();
					}
				});
			}
			else {

		        var html = [];
		        html.push('<h3>Table Information</h3>');        
		        this.makeTableByRecord(responses.tables, html);
		        html.push('<h3>View Information</h3>');
		        this.makeTableByRecord(responses.views, html);
		        html.push('<h3>Procedure Information</h3>');        
		        this.makeTableByRecord(responses.procedures, html);
		        html.push('<h3>Function Information</h3>');        
		        this.makeTableByRecord(responses.functions, html);
		        html.push('<h3>Trigger Information</h3>');        
		        this.makeTableByRecord(responses.triggers, html);
		        html.push('<h3>Event Information</h3>');        
		        this.makeTableByRecord(responses.events, html);
		        html.push('<h3>Create Database DDL</h3>');
		        html.push('<div>'+responses.ddl.records[0][1].replace(/\n/gi, '<br/>')+'</div>');
		        dom.setHTML(html.join(""));
			}

		}, this))();
	},

	pasteSQLStatement : function(mode, node){

		var db = this.getParentNode(node);
		var table = node.data.text;
		var a		= [], b = [];
		var func	= {
        	insert : Ext.Function.bind(function(records){

		        Ext.Array.each(records, function(row, idx){

		            a.push('`'+row[0]+'`');
		            b.push('\''+row[0]+'\'');
		        });
		        return this.getEngine().getQuery('TABLE_INSERT', db, table, a.join(','), b.join(','));
        	}, this),
        	update : Ext.Function.bind(function(records){

		        Ext.Array.each(records, function(row, idx){

		            a.push('`'+row[0]+'`=\''+row[0]+'\'');
		            if(row[3] == "PRI"){ b.push('`'+row[0]+'`=\''+row[0]+'\''); }
		        });
		        return this.getEngine().getQuery('TABLE_UPDATE', db, table, a.join(',\n'), b.join(' AND '));
        	}, this),
        	delete : Ext.Function.bind(function(records){

			    Ext.Array.each(records, function(row, idx){

		            if(row[3] == "PRI"){ a.push('`'+row[0]+'`=\''+row[0]+'\''); }
		        });
		        return this.getEngine().getQuery('TABLE_DELETE', db, table, a.join(' AND '));
        	}, this),
        	select : Ext.Function.bind(function(records){

		        Ext.Array.each(records, function(row, idx){

		            a.push('`'+row[0]+'`');
		        });
		        return this.getEngine().getQuery('TABLE_DELETE', db, table, a.join(', '));
        	}, this)
        };

		this.tunneling({
			db : db,
			query : 'DESCRIBE `'+db+'`.`'+table+'`',
			success : function(config, response){

				var query = func[mode](response.records);
				console.log(query);
				this.setActiveEditorValue();
			}
		});
	},

	changeTableToType : function(engine){

		var node	= this.getSelectedNode();
		var db		= this.getParentNode(node);
		var table	= node.data.text;
		this.tunneling({
			db : db,
			query : this.getEngine().getQuery('CHANGE_TABLE_TYPE', db, table, engine),
			success		: function(config, response){

                this.openMessage('Table engine changed to '+engine);
			}
		});
	},

	createView : function(){

    	var node = this.getSelectedNode();
    	var db = this.getParentNode(node);
		Ext.Msg.prompt('Create View', 'Please enter new view name:', function(btn, text){

		    if (btn == 'ok'){

		    	var sql = this.getEngine().getQuery('CREATE_VIEW', db, name);
		    	this.openQueryTab();
		    	this.setActiveEditorValue(sql);
		    }
		}, this);
	},

	alterView : function(){

    	var node = this.getSelectedNode();
    	var db = this.getParentNode(node);
		this.tunneling({
			db : db,
			query : this.getEngine().getQuery('ALTER_VIEW', db, node.getData().text),
			node : node,
			success : function(config, response){

		    	this.openQueryTab();
		    	this.setActiveEditorValue(response.records[0][1]);
			}
		});
	},

	createProcedure : function(){

    	var node = this.getSelectedNode();
    	var db = this.getParentNode(node);
		Ext.Msg.prompt('Create Procedure', 'Please enter new procedure name:', function(btn, name){

		    if (btn == 'ok'){

		    	var sql = this.getEngine().getQuery('CREATE_PROCEDURE', db, name);
		    	this.openQueryTab();
		    	this.setActiveEditorValue(sql);
		    }
		}, this);
	},

	createFunction : function(){

    	var node = this.getSelectedNode();
    	var db = this.getParentNode(node);
		Ext.Msg.prompt('Create Function', 'Please enter new function name:', function(btn, name){

		    if (btn == 'ok'){

		    	var sql = this.getEngine().getQuery('CREATE_FUNCTION', db, name);
		    	this.openQueryTab();
		    	this.setActiveEditorValue(sql);
		    }
		}, this);
	},

	createTrigger : function(){

    	var node = this.getSelectedNode();
    	var db = this.getParentNode(node);
		Ext.Msg.prompt('Create Trigger', 'Please enter new trigger name:', function(btn, name){

		    if (btn == 'ok'){

		    	var sql = this.getEngine().getQuery('CREATE_TRIGGER', db, name);
		    	this.openQueryTab();
		    	this.setActiveEditorValue(sql);
		    }
		}, this);
	},

	createEvent : function(){

    	var node = this.getSelectedNode();
    	var db = this.getParentNode(node);
		Ext.Msg.prompt('Create Event', 'Please enter new event name:', function(btn, name){

		    if (btn == 'ok'){

		    	var sql = this.getEngine().getQuery('CREATE_EVENT', db, name);
		    	this.openQueryTab();
		    	this.setActiveEditorValue(sql);
		    }
		}, this);
	},

	tunneling : function(config){

        Ext.applyIf(config, {
			connectInfo	: this.getActiveMainTab().config.connectInfo,
			db			: '',
			query		: '',
			async		: true,
			success		: function(config, response){

                var msg = response.affected_rows+' row(s) affected<br>';
                msg += 'Execution Time : 00:00:00:000<br>';
                msg += 'Transfer Time  : 00:00:00:000<br>';
                msg += 'Total Time     : 00:00:00:000';
                this.openMessage(msg);
			},
			failure		: function(config, response){

				this.openMessage(response);
			}
        });
        
		Ext.data.JsonP.request({
			url			: config.connectInfo.http_tunneling,
			callbackKey	: 'callback',
			async		: config.async,
			params		: {
				db		: config.db,
				host	: config.connectInfo.host,
				user	: config.connectInfo.user,
				pass	: config.connectInfo.pass,
				charset	: config.connectInfo.charset,
				port	: config.connectInfo.port,
				query   : config.query
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
	}
});