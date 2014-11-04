Ext.define('Planche.controller.menu.Table', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'Paste SQL Statement',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                if(!this.getSelectedNode()){

                    return true;
                }

                return false;
            },
            menu : [{
                text: 'INSERT INTO &lt;Table Name&gt;..',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.pasteSQLStatement('insert', node);
                }
            },{
                text: 'UPDATE &lt;Table Name&gt; SET..',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.pasteSQLStatement('update', node);
                }
            },{
                text: 'DELETE FROM &lt;Table Name&gt;..',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.pasteSQLStatement('delete', node);
                }
            },{
                text: 'SELECT &lt;col-1&gt;..&lt;col-n&gt; FROM &lt;Table Name&gt;',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.pasteSQLStatement('select', node);
                }
            }]
        },{
            text : 'Copy Table(s) To Differnt Host/Database(Not Yet)',
            disabled : true
        },'-',{
            text : 'Open Table',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                if(!this.getSelectedNode()){

                    return true;
                }

                return false;
            },
            handler : function(){

                var node = this.getSelectedNode();
                this.openTable(node);
            }
        },{
            text : 'Create Table',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                if(!this.getSelectedNode()){

                    return true;
                }

                return false;
            },
            handler : function(){

                this.openCreateTableWindow();
            }
        },{
            text : 'Alter Table',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                if(!this.getSelectedNode()){

                    return true;
                }

                return false;
            },
            handler : function(){

                var node = this.getSelectedNode();
                this.openAlterTableWindow(node);
            }
        },{
            text : 'Manage Indexes(Not Yet)',
            disabled : true
        },{
            text : 'Relationships/Foreign Keys(Not Yet)',
            disabled : true
        },{
            text : 'More Table Operations',
            scope : this.application,
            allowDisable : function(topBtn, menu){

                if(!this.getSelectedNode()){

                    return true;
                }

                return false;
            },
            menu : [{
                text: 'Rename Table',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.renameTable(node);
                }
            },{
                text: 'Truncate Table',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.truncateTable(node);
                }
            },{
                text: 'Drop Table From Database',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.dropTable(node);
                }
            },{
                text: 'Reorder Column(s)',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.openReorderColumns(node);
                }
            },{
                text: 'Duplicate Table Structure/Data',
                scope : this.application,
                disabled : true,
                handler : function(){

                    
                }
            },{
                text: 'View Advanced Properties',
                scope : this.application,
                handler : function(){

                    var node = this.getSelectedNode();
                    this.openAdvancedProperties(node);
                }
            },{
                text: 'Change Table To Type',
                menu : [
                    {
                        scope : this.application,
                        text : 'MYISAM', 
                        handler : function(btn){

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this.application,
                        text : 'MRG_MYISAM', 
                        handler : function(btn){

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this.application,
                        text : 'CSV', 
                        handler : function(btn){

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this.application,
                        text : 'BLACKHOLE', 
                        handler : function(btn){

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this.application,
                        text : 'MEMORY', 
                        handler : function(btn){

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this.application,
                        text : 'FEDERATED', 
                        handler : function(btn){

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this.application,
                        text : 'ARCHIVE', 
                        handler : function(btn){

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this.application,
                        text : 'INNODB', 
                        handler : function(btn){

                            this.changeTableToType(btn.text);
                        }
                    },
                    {
                        scope : this.application,
                        text : 'PERFORMANCE_SCHEMA', 
                        handler : function(btn){

                            this.changeTableToType(btn.text);
                        }
                    }
                ]
            }]
        },'-',{
            text : 'Backup/Export(Not Yet)',
            disabled : true,
            menu : [{

            }]
        },{
            text : 'Import(Not Yet)',
            disabled : true,
            menu : [{

            }]
        },'-',{
            text : 'Download Result Set To Excel(Not Yet)',
            disabled : true
        },{
            text : 'Download To CSV(Not Yet)',
            disabled : true
        },{
            text : 'Download To TSV(Not Yet)',
            disabled : true
        },{
            text : 'Copy To Google Spreadsheet(Not Yet)',
            disabled : true
        },'-',{
            text : 'Create Trigger(Not Yet)',
            disabled : true
        }]);

        this.added = true;
    },

    show : function(topBtn){

        if(!this.added){

            this.add(topBtn);
        }

        Ext.Array.each(topBtn.menu.query('menuitem'), function(menu, idx){
            
            switch(typeof menu.allowDisable){

                case 'function':

                    menu.setDisabled(menu.allowDisable.apply(menu.scope || menu, [topBtn, menu]));
                    break;

                case 'boolean' :

                    menu.setDisabled(menu.allowDisable);
                    break;
            }
        });

        topBtn.menu.showBy(topBtn);
    }
});