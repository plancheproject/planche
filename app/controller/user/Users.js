Ext.define('Planche.controller.user.Users', {
    extend: 'Ext.app.Controller',

    initWindow : function(db, tb, result){

        var columns = this.makeListColumns();

        var fields = [];
        Ext.each(columns, function(obj){

            fields.push(obj.dataIndex);
        });

        var records = [];
        Ext.Array.each(result.records, function(row, ridx){

            var record = {};
            Ext.Array.each(result.fields, function(col, cidx){

                if(cidx > 1){

                    record[col.name] = row[cidx] == 'Y' ? true : false;
                }
                else{

                    record[col.name] = row[cidx];
                }
            });
            records.push(record);
        });

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
                text : 'Save Changes',
                scope : this,
                handler : function(btn, e){
                    
                    var win = btn.up('window');
                    win.hide();
                }
            },{
                text : 'Cancel Changes',
                scope : this,
                handler : function(btn, e){
                    
                    var win = btn.up('window');
                    win.hide();
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
            { text: 'Host', dataIndex: 'Host', width : 100, renderer: function(value, p, record){
                
                return Ext.String.format('<img src=\'./images/icon_server.png\'> {0}', value);
            }},
            { text: 'User', dataIndex: 'User', width : 100, renderer: function(value, p, record){
                
                return Ext.String.format('<img src=\'./images/icon_user.png\'> {0}', value);
            }},
            { text : 'Select', xtype :'checkcolumn', dataIndex : 'Select_priv', width : 60 },
            { text : 'Insert', xtype :'checkcolumn', dataIndex : 'Insert_priv', width : 60 },
            { text : 'Update', xtype :'checkcolumn', dataIndex : 'Update_priv', width : 60 },
            { text : 'Delete', xtype :'checkcolumn', dataIndex : 'Delete_priv', width : 60 },
            { text : 'Create', xtype :'checkcolumn', dataIndex : 'Create_priv', width : 60 },
            { text : 'Drop', xtype :'checkcolumn', dataIndex : 'Drop_priv', width : 60 },
            { text : 'Reload', xtype :'checkcolumn', dataIndex : 'Reload_priv', width : 60 },
            { text : 'Shutdown', xtype :'checkcolumn', dataIndex : 'Shutdown_priv', width : 60 },
            { text : 'Process', xtype :'checkcolumn', dataIndex : 'Process_priv', width : 60 },
            { text : 'File', xtype :'checkcolumn', dataIndex : 'File_priv', width : 60 },
            { text : 'Grant', xtype :'checkcolumn', dataIndex : 'Grant_priv', width : 60 },
            { text : 'References', xtype :'checkcolumn', dataIndex : 'References_priv', width : 60 },
            { text : 'Index', xtype :'checkcolumn', dataIndex : 'Index_priv', width : 60 },
            { text : 'Alter', xtype :'checkcolumn', dataIndex : 'Alter_priv', width : 60 },
            { text : 'Show_db', xtype :'checkcolumn', dataIndex : 'Show_db_priv', width : 60 },
            { text : 'Super', xtype :'checkcolumn', dataIndex : 'Super_priv', width : 60 },
            { text : 'Create_tmp_table', xtype :'checkcolumn', dataIndex : 'Create_tmp_table_priv', width : 60 },
            { text : 'Lock_tables', xtype :'checkcolumn', dataIndex : 'Lock_tables_priv', width : 60 },
            { text : 'Execute', xtype :'checkcolumn', dataIndex : 'Execute_priv', width : 60 },
            { text : 'Repl_slave', xtype :'checkcolumn', dataIndex : 'Repl_slave_priv', width : 60 },
            { text : 'Repl_client', xtype :'checkcolumn', dataIndex : 'Repl_client_priv', width : 60 },
            { text : 'Create_view', xtype :'checkcolumn', dataIndex : 'Create_view_priv', width : 60 },
            { text : 'Show_view', xtype :'checkcolumn', dataIndex : 'Show_view_priv', width : 60 },
            { text : 'Create_routine', xtype :'checkcolumn', dataIndex : 'Create_routine_priv', width : 60 },
            { text : 'Alter_routine', xtype :'checkcolumn', dataIndex : 'Alter_routine_priv', width : 60 },
            { text : 'Create_user', xtype :'checkcolumn', dataIndex : 'Create_user_priv', width : 60 },
            { text : 'Event', xtype :'checkcolumn', dataIndex : 'Event_priv', width : 60 },
            { text : 'Trigger', xtype :'checkcolumn', dataIndex : 'Trigger_priv', width : 60 },
            { text : 'Create_tablespace', xtype :'checkcolumn', dataIndex : 'Create_tablespace_priv', width : 60 }
        ];
    }
});