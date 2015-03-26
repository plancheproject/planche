Ext.define('Planche.controller.layout.InfoTab', {
    extend: 'Ext.app.Controller',
    init : function(){

    	this.control({
    		'info-tab' : {
		    	show : function(grid){

		    		this.openInfo(this.application.getSelectedNode());
		    	}
    		},
			'scheme-tree' : {
               select : function(view){

                    var treeview = view.views[0];                       
                    var tree = treeview.up("treepanel");

                    var app = this.getApplication();

                    app.setSelectedTree(tree);

                    var node = app.getSelectedNode();

                    if(node.data.depth == 1){

                        var info = app.getActiveInfoTab();
                        if(info.isVisible()){

                            this.openInfo(node);
                        }
                    }
                    else if(node.data.depth == 2){

                        var info = app.getActiveInfoTab();
                        if(info.isVisible()){

                            this.openInfo(node);
                        }
                    }
                    else if(node.data.depth == 3){

                        var grid = app.getActiveTableDataTab();
                        
                        if(grid.isVisible() && (app.getParentNode(node, 2) == 'Tables' || app.getParentNode(node, 2) == 'Views')){

                            app.openTable(node)
                        }

                        var info = app.getActiveInfoTab();
                        if(info.isVisible()){

                            this.openInfo(node);
                        }
                    }
                }
			}
    	});
    },

	openInfo : function(node){

		var cmd = ['Database', 'Tables', 'Table'][node.data.depth - 1];
		if(!cmd){ return; }
        this[['open', cmd, 'Info'].join("")](node);
	},

	openTableInfo : function(node){

		var 
		app			= this.getApplication(),
		api			= app.getAPIS(),
		db			= app.getParentNode(node),
		info		= app.getActiveInfoTab(),
		dom			= Ext.get(info.getEl().query("div[id$=innerCt]")),
		queries		= {
			create	: api.getQuery('TABLE_CREATE_INFO', db, node.data.text),
			fields	: api.getQuery('SHOW_FULL_FIELDS', db, node.data.text),
			keys	: api.getQuery('TABLE_KEYS_INFO', db, node.data.text)
		},
		keys		= Ext.Object.getKeys(queries),
		responses	= {},
		tunneling;

		(tunneling = Ext.Function.bind(function(){

			var key = keys.shift();
			if(key) {

				app.tunneling({
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
		        html.push('<div class="info">'+responses.create.records[0][1].replace(/\n/gi, '<br/>')+'</div>');
		        dom.setHTML(html.join(""));
			}

		}, this))();
	},

	openTablesInfo : function(node){

		var 
		app		= this.getApplication(),
		api		= app.getAPIS(),
		db		= app.getParentNode(node),
		info	= app.getActiveInfoTab(),
		dom		= Ext.get(info.getEl().query("div[id$=innerCt]")),
		me		= this;

		app.tunneling({
			db : db,
			query : api.getQuery('SHOW_ALL_TABLE_STATUS', db),
			node : node,
			success : function(config, response){

		        var html = [];
		        html.push('<h1>Show Table Status</h1>');
		        me.makeTableByRecord(response, html);
		        dom.setHTML(html.join(""));
			}
		});
	},

	openDatabaseInfo : function(node){

		var 
		app			= this.getApplication(),
		api			= app.getAPIS(),
		db			= app.getParentNode(node),
		info		= app.getActiveInfoTab(),
		dom			= Ext.get(info.getEl().query("div[id$=innerCt]")),
		queries		= {
			tables		: api.getQuery('SHOW_ALL_TABLE_STATUS', db),
			views		: api.getQuery('SHOW_VIEWS', db),
			procedures	: api.getQuery('SHOW_PROCEDURES', db),
			functions	: api.getQuery('SHOW_FUNCTIONS', db),
			triggers	: api.getQuery('SHOW_TRIGGERS', db),
			events		: api.getQuery('SHOW_EVENTS', db),
			ddl			: api.getQuery('SHOW_DATABASE_DDL', db)
		},
		keys		= Ext.Object.getKeys(queries),
		responses	= {},
		tunneling;

		(tunneling = Ext.Function.bind(function(){

			var key = keys.shift();
			if(key) {

				app.tunneling({
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
		        html.push('<div class="info">'+responses.ddl.records[0][1].replace(/\n/gi, '<br/>')+'</div>');
		        dom.setHTML(html.join(""));
			}

		}, this))();
	},

	makeTableByRecord : function(record, html){

		var html = html || [];
        html.push('<table class="info" width="100%">');
        html.push('<tr>');
        Ext.Array.each(record.fields, function(col, cidx){

            html.push('<th>'+col.name+'</th>');
        });
        html.push('</tr>');
        Ext.Array.each(record.records, function(row, ridx){

            html.push('<tr>');
            Ext.Array.each(record.fields, function(col, cidx){

                html.push('<td>'+row[cidx]+'</td>');
            });
            html.push('</tr>');
        });
        html.push('</table>');
        return html;
	}
});