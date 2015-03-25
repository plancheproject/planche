Ext.define('Planche.controller.command.Variables', {
    extend: 'Ext.app.Controller',
    grid : null,
    initWindow : function(){

        Ext.create('Planche.lib.Window', {
            id : 'window-'+this.id,
            stateful: true,
            title : 'Show Variables',
            layout : 'fit',
            bodyStyle:"background-color:#FFFFFF",
            width : 900,
            height: 500,
            overflowY: 'auto',
            autoScroll : true,
            modal : true,
            plain: true,
            fixed : true,
            shadow : false,
            autoShow : true,
            constrain : true,
            items : this.initGrid(),
            buttons : [{
                text : 'Close',
                scope : this,
                handler : function(btn, e){
                    
                    var win = btn.up('window');
                    win.destroy();
                }
            }],
            listeners : {
                scope : this,
                boxready : function(){

                    this.loadList();
                }
            }
        });
    },

    initGrid : function(){

        var columns = this.makeListColumns();

        var fields = [];
        Ext.each(columns, function(obj){

            fields.push(obj.dataIndex);
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            border : false,
            columnLines: true,
            width : '100%',
            flex  : 1,
            columns : columns,
            store: Ext.create('Ext.data.Store', {
                fields: fields
            })
        });

        return this.grid;
    },

    loadList : function(){

        var app = this.application;

        var node = app.getSelectedNode();
        var db = app.getParentNode(node);
        app.tunneling({
            db : db,
            query : app.getAPIS().getQuery('SHOW_VARIABLES', db),
            success : Ext.Function.bind(function(config, response){
                
                var records = this.makeRecords(response.fields, response.records);

                this.grid.store.loadData(records);
                this.grid.setLoading(false);

            }, this)
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
    makeListColumns : function(){   
        
        return [
            { text: 'Variable Name', dataIndex: 'Variable_name', width : 300},
            { text: 'Value', dataIndex: 'Value', flex : 1}
        ];
    }
});