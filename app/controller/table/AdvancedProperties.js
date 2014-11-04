Ext.define('Planche.controller.table.AdvancedProperties', {
    extend: 'Ext.app.Controller',

    initWindow : function(db, tb, result){

        Ext.create('Planche.lib.Window', {
            stateful: true,
            title : 'Advanced properties \''+tb+'\' in \''+db+'\'',
            layout : 'fit',
            bodyStyle:"background-color:#FFFFFF",
            width : 400,
            height: 300,
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
                text : 'close',
                scope : this,
                handler : this.close
            }],
            listeners: {
                scope : this,
                boxready : function(){

                    this.initTableData(result);
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

        this.columnGrid = Ext.create('Ext.grid.Panel', {
            border : false,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2
                })
            ],
            columnLines: true,
            width : '100%',
            flex  : 1,
            columns : columns,
            store: Ext.create('Ext.data.Store', {
                fields:fields
            })
        });

        return this.columnGrid;
    },


    initTableData : function(result){

        var store = this.columnGrid.getStore();
        
        var records = [];
        Ext.Object.each(result.fields, function(idx, col){

            records.push({
                variable : col.name,
                values   : result.records[0][idx]
            });
        });
        store.insert(0, records);
    },

    makeListColumns : function(){   

        return [
            { text: 'Variable', dataIndex: 'variable', width : 120},
            { text: 'Values', dataIndex: 'values', flex : 1}
        ];
    },


    close : function(btn){

        btn.up('window').destroy();
    }
});