Ext.define('Planche.controller.command.Process', {
    extend: 'Ext.app.Controller',
    grid : null,
    initWindow : function(){

        Ext.create('Planche.lib.Window', {
            id : 'window-'+this.id,
            stateful: true,
            title : 'Show Process List',
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
                text : 'Kill Process',
                scope : this,
                handler : function(btn, e){
                    
                    
                }
            },{
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
            }),
            tbar : [
                { xtype: 'text',  text : 'Refresh Per Sec', margin : '0 0 0 5'},
                { xtype: 'textfield', value: 0, scope: this, width : 40, margin : '0 0 0 5', listeners : {
                    scope : this,
                    specialkey: function (field, el) {

                        if (el.getKey() == Ext.EventObject.ENTER){

                            this.loadList();
                        }
                    }
                }},
                { xtype: 'button', text: 'Refresh', cls : 'btn', scope: this, margin : '0 0 0 5', scope : this, handler : function(btn){

                    this.loadList();
                }},
                { xtype: 'button', text: 'Stop', cls : 'btn', scope: this, margin : '0 0 0 5', scope : this, handler : function(btn){

                    var textRefreshPerSec = this.grid.down('text[text=Refresh Per Sec]').next();

                    textRefreshPerSec.setValue(0);
                }}
            ]
        });

        return this.grid;
    },

    loadList : function(){

        var textRefreshPerSec = this.grid.down('text[text=Refresh Per Sec]').next();

        var refreshPerSec = parseFloat(textRefreshPerSec.getValue());

        var app = this.application;

        var node = app.getSelectedNode();
        var db = app.getParentNode(node);
        app.tunneling({
            db : db,
            query : app.getEngine().getQuery('SHOW_PROCESS_LIST', db),
            success : Ext.Function.bind(function(config, response){
                
                var records = this.makeRecords(response.fields, response.records);

                this.grid.store.loadData(records);
                this.grid.setLoading(false);

                if(refreshPerSec > 0){

                    setTimeout(Ext.Function.bind(this.loadList, this), refreshPerSec * 1000);
                }
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
            { text: 'Id', dataIndex: 'Id', width : 100},
            { text: 'User', dataIndex: 'User', width : 100},
            { text : 'Host', dataIndex : 'Host', width : 60 },
            { text : 'Db', dataIndex : 'Db', width : 60 },
            { text : 'Command', dataIndex : 'Command', width : 60 },
            { text : 'State', dataIndex : 'State', width : 60 },
            { text : 'Info', dataIndex : 'Info', flex : 1 }
        ];
    }
});