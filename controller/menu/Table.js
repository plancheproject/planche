Ext.define('Planche.controller.menu.Table', {
    extend: 'Ext.app.Controller',
    added : false,
    add : function(topBtn){

        topBtn.menu.add([{
            text : 'Paste SQL Statement',
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
            text : 'Copy Table(s) To Differnt Host/Database'
        },'-',{
            text : 'Open Table'
        },{
            text : 'Create Table'
        },{
            text : 'Alter Table'
        },{
            text : 'Manage Indexes'
        },{
            text : 'Relationships/Foreign Keys'
        },{
            text : 'More Table Operations',
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
            text : 'Backup/Export',
            menu : [{

            }]
        },{
            text : 'Import',
            menu : [{

            }]
        },'-',{
            text : 'Download Result Set To Excel'
        },{
            text : 'Download To CSV'
        },{
            text : 'Download To TSV'
        },{
            text : 'Copy To Google Spreadsheet'
        },'-',{
            text : 'Create Trigger'
        }]);

        this.added = true;
    },

    show : function(topBtn){

        if(!this.added){

            this.add(topBtn);
        }

        topBtn.menu.showBy(topBtn);
    }
});