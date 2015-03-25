Ext.define('Planche.controller.layout.SchemeTreeContextMenu', {
    extend: 'Ext.app.Controller',
    init : function(){

        this.control({
            'scheme-tree' : {
                itemcontextmenu : this.initContextMenu
            }
        });
    },

    initContextMenu : function(view, record, item, index, e, eOpts){

        //서버트리의 이벤트를 잡아 내서 node위에서 right click을 했을 경우만 
        //context메뉴를 보여준다.
        e.preventDefault();

        var app = this.getApplication(),
            menu = app.getSchemeContextMenu(),
            node = app.getSelectedNode(),
            data = node.getData(),
            cmd;

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

        menu.removeAll();
        menu.add(this['load'+cmd+'ContextMenu']());
        menu.showAt(e.getXY());
    },

    loadRootContextMenu : function(){

        var app = this.getApplication();

        return [
            {
                text: 'Create Database',
                handler : function(){

                    app.createDatabase();
                }
            },
            {
                text: 'Refresh All',
                handler : function(){

                    var node = app.getSelectedNode();
                    app.reloadTree(node);
                }
            }
        ];
    },

    loadDatabaseContextMenu : function(){

        var app = this.getApplication();

        return [
            {
                text: 'Create Database',
                handler : function(){

                    app.createDatabase();
                }
            },{
                text: 'Alter Database',
                handler : function(){

                    var node = app.getSelectedNode();
                    app.alterDatabase(node);
                }
            },
            {
                text: 'Drop Database',
                handler : function(){

                    var node = app.getSelectedNode();
                    app.dropDatabase(node);
                }
            },{
                text: 'Truncate Database',
                handler : function(){

                    var node = app.getSelectedNode();
                    app.truncateDatabase(node);
                }
            },{
                text: 'Empty Database',
                handler : function(){

                    var node = app.getSelectedNode();
                    app.emptyDatabase(node);
                }
            }
        ];
    },

    loadTablesContextMenu : function(){

        var app = this.getApplication();
        return [{
            text: 'Create Table',
            handler : function(){

                app.openCreateTableWindow();
            }
        },{
            text: 'Copy Table(s) To Differnt Host/Database',
            disabled : true,
            handler : function(){

            }
        }];
    },

    loadTableContextMenu : function(){

        var app = this.getApplication();

        return [{
            text: 'Paste SQL Statement',
            defaults : {
                scope : this
            },
            listeners : {
                scope : this,
                activate : function(menu){

                    var subTab = app.getActiveQueryTab();
                    Ext.Object.each(menu.menu.items.items, function(idx, obj){ 
                        obj[subTab ? 'enable' : 'disable'](); 
                    });
                }
            },
            menu : [{
                text: 'INSERT INTO &lt;Table Name&gt;..',
                scope : this,
                handler : function(){

                    var node = app.getSelectedNode();
                    app.pasteSQLStatement('insert', node);
                }
            },{
                text: 'UPDATE &lt;Table Name&gt; SET..',
                scope : this,
                handler : function(){

                    var node = app.getSelectedNode();
                    app.pasteSQLStatement('update', node);
                }
            },{
                text: 'DELETE FROM &lt;Table Name&gt;..',
                scope : this,
                handler : function(){

                    var node = app.getSelectedNode();
                    app.pasteSQLStatement('delete', node);
                }
            },{
                text: 'SELECT &lt;col-1&gt;..&lt;col-n&gt; FROM &lt;Table Name&gt;',
                scope : this,
                handler : function(){

                    var node = app.getSelectedNode();
                    app.pasteSQLStatement('select', node);
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

                app.openTable(app.getSelectedNode());
            }
        },{
            text: 'Create Table',
            handler : function(){

                app.openCreateTableWindow();
            }
        },{
            text: 'Alter Table',
            scope : this,
            handler : function(){
                
                var node = app.getSelectedNode();
                app.openAlterTableWindow(node);
            }
        },{
            text: 'More Table Operations',
            menu : [{
                text: 'Rename Table',
                scope : this,
                handler : function(){

                    var node = app.getSelectedNode();
                    app.renameTable(node);
                }
            },{
                text: 'Truncate Table',
                scope : this,
                handler : function(){

                    var node = app.getSelectedNode();
                    app.truncateTable(node);
                }
            },{
                text: 'Drop Table From Database',
                scope : this,
                handler : function(){

                    var node = app.getSelectedNode();
                    app.dropTable(node);
                }
            },{
                text: 'Reorder Column(s)',
                scope : this,
                handler : function(){

                    var node = app.getSelectedNode();
                    app.openReorderColumns(node);
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

                    var node = app.getSelectedNode();
                    app.openAdvancedProperties(node);
                }
            },{
                text: 'Change Table To Type',
                menu : [
                    {
                        scope : this,
                        text : 'MYISAM', 
                        handler : function(btn){
                            app.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this,
                        text : 'MRG_MYISAM', 
                        handler : function(btn){
                            app.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this,
                        text : 'CSV', 
                        handler : function(btn){
                            app.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this,
                        text : 'BLACKHOLE', 
                        handler : function(btn){
                            app.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this,
                        text : 'MEMORY', 
                        handler : function(btn){
                            app.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this,
                        text : 'FEDERATED', 
                        handler : function(btn){
                            app.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this,
                        text : 'ARCHIVE', 
                        handler : function(btn){
                            app.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this,
                        text : 'INNODB', 
                        handler : function(btn){
                            app.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this,
                        text : 'PERFORMANCE_SCHEMA', 
                        handler : function(btn){

                            app.changeTableToType(btn.text);
                        }
                    }
                ]
            }]
        },{
            xtype: 'menuseparator'
        },{
            text: 'Create Trigger',
            handler : function(){

                var node = app.getSelectedNode();
                app.createTrigger(node);
            }
        }];
    },

    loadViewsContextMenu : function(){

        return [{
            text: 'Create View',
            handler : function(){

                this.getApplication().createView();
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

        var app = this.getApplication();

        return [{
            text: 'Create View',
            handler : function(){

                app.createView();
            }
        },
        {
            text: 'Alter View',
            handler : function(){

                app.alterView();
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

                app.openTable(app.getSelectedNode());
            }
        }];
    },

    loadEventsContextMenu : function(){

        var app = this.getApplication();

        return [{
            text: 'Create Event',
            handler : function(){

                app.createEvent();
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

        var app = this.getApplication();

        return [{
            text: 'Create Event',
            handler : function(){

                app.createEvent();
            }
        },
        {
            text: 'Alter Event',
            handler : function(){

                app.alterEvent();
            }
        },
        {
            text: 'Drop Event',
            handler : function(){

                app.dropEvent();
            }
        },
        {
            text: 'Rename Event',
            handler : function(){

                app.renameEvent();
            }
        }];
    },

    loadTriggersContextMenu : function(){

        var app = this.getApplication();

        return [{
            text: 'Create Trigger',
            handler : function(){

                app.createTrigger();
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

        var app = this.getApplication();

        return [{
            text: 'Create Trigger',
            handler : function(){

                app.createTrigger();
            }
        },
        {
            text: 'Alter Trigger',
            handler : function(){

                app.alterTrigger();
            }
        },
        {
            text: 'Drop Trigger',
            handler : function(){

                app.dropTrigger();
            }
        },
        {
            text: 'Rename Trigger',
            handler : function(){

                app.renameTrigger();
            }
        }];
    },

    loadFunctionsContextMenu : function(){

        var app = this.getApplication();

        return [{
            text: 'Create Function',
            handler : function(){

                app.createFunction();
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

        var app = this.getApplication();

        return [{
            text: 'Create Function',
            handler : function(){

                app.createFunction();
            }
        },
        {
            text: 'Alter Function',
            handler : function(){

                app.alterFunction();
            }
        },
        {
            text: 'Drop Function',
            handler : function(){

                app.dropFunction();
            }
        }];
    },

    loadProceduresContextMenu : function(){

        var app = this.getApplication();

        return [{
            text: 'Create Procedure',
            handler : function(){

                app.createProcedure();
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

        var app = this.getApplication();

        return [{
            text: 'Create Procedure',
            handler : function(){

                app.createProcedure();
            }
        },
        {
            text: 'Alter Procedure',
            handler : function(){

                app.alterProcedure();
            }
        },
        {
            text: 'Drop Procedure',
            handler : function(){

                app.dropProcedure();
            }
        }];
    }

});

