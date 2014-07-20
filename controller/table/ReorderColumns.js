Ext.define('Planche.controller.table.ReorderColumns', {
    extend: 'Ext.app.Controller',

    initWindow : function(db, tb, result){

        Ext.create('Planche.lib.Window', {
            stateful: true,
            title : 'Reorder columns \''+tb+'\' in \''+db+'\'',
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
                text : 'Up',
                scope : this,
                handler : this.up
            },{
                text : 'Down',
                scope : this,
                handler : this.down
            },{
                text : 'Save',
                scope : this,
                handler : this.save
            },{
                text : 'Close',
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

        this.grid = Ext.create('Ext.grid.Panel', {
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

        return this.grid;
    },


    initTableData : function(result){

        var store = this.grid.getStore();
        
        var records = [];
        Ext.Object.each(result.records, function(idx, row){

            records.push({
                field : row[0],
                type  : row[1]
            });
        });
        store.insert(0, records);
    },

    makeListColumns : function(){   

        return [
            { text: 'Field', dataIndex: 'field', width : 120},
            { text: 'Type', dataIndex: 'type', flex : 1}
        ];
    },

    up : function(btn){

        this.moveSelectedRow('up');
    },

    down : function(btn){

        this.moveSelectedRow('down');
    },

    save : function(btn){

        btn.up('window').destroy();
    },

    close : function(btn){

        btn.up('window').destroy();
    },

    moveSelectedRow : function(direction) {

        var record = this.grid.getSelectionModel().getSelection()[0];
        if (!record) {
            return;
        }
        var index = this.grid.getStore().indexOf(record);
        if (direction == 'up') {
            index--;
            if (index < 0) {
                return;
            }
        } else {
            index++;
            if (index >= this.grid.getStore().getCount()) {
                return;
            }
        }
        this.grid.getStore().remove(record);
        this.grid.getStore().insert(index, record);
        this.grid.getSelectionModel().select(index, true);
    }
});