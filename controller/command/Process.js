Ext.define('Planche.controller.command.Process', {
    extend: 'Ext.app.Controller',

    initWindow : function(result){

        var columns = this.makeListColumns();

        var fields = [];
        Ext.each(columns, function(obj){

            fields.push(obj.dataIndex);
        });

        var records = result.records;

        Ext.create('Planche.lib.Window', {
            id : 'window-'+this.id,
            stateful: true,
            title : 'User Manager',
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
            items : [
                Ext.create('Ext.grid.Panel', {
                    id : 'connect-grid',
                    border : false,
                    columnLines: true,
                    width : '100%',
                    flex  : 1,
                    columns : columns,
                    store: Ext.create('Ext.data.Store', {
                        fields:fields,
                        data: records
                    })
                })
            ],
            buttons : [{
                text : 'Kill Process',
                scope : this,
                handler : function(btn, e){
                    
                    
                }
            },{
                text : 'Close',
                scope : this,
                handler : function(btn, e){
                    
                    var win = btn.up('window');
                    win.hide();
                }
            }]
        });
    },

    makeListColumns : function(){   
        
        return [
            { text: 'Id', dataIndex: 'Id', width : 100},
            { text: 'User', dataIndex: 'User', width : 100},
            { text : 'Host', xtype :'checkcolumn', dataIndex : 'Host', width : 60 },
            { text : 'Db', xtype :'checkcolumn', dataIndex : 'Db', width : 60 },
            { text : 'Command', xtype :'checkcolumn', dataIndex : 'Command', width : 60 },
            { text : 'State', xtype :'checkcolumn', dataIndex : 'State', width : 60 },
            { text : 'Info', xtype :'checkcolumn', dataIndex : 'Info', width : 60 }
        ];
    }
});