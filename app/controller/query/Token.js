Ext.define('Planche.controller.query.Token', {
    extend: 'Ext.app.Controller',
    initWindow : function (tokens) {

        this.tokens = tokens;

        Ext.create('Planche.lib.Window', {
            id : 'window-'+this.id,
            stateful: true,
            title : 'Show Tokens',
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
                handler : function (btn, e) {
                    
                    var win = btn.up('window');
                    win.destroy();
                }
            }]
        });
    },

    initGrid : function () {

        var columns = this.makeListColumns();

        var fields = [];
        Ext.each(columns, function (obj) {

            fields.push(obj.dataIndex);
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            border : false,
            columnLines: true,
            width : '100%',
            flex  : 1,
            columns : columns,
            store: Ext.create('Ext.data.Store', {
                fields: fields,
                data : this.makeData()
            })
        });

        return this.grid;
    },

    makeData : function () {

        var type = [];
        Ext.Object.each(Planche.lib.QueryTokenType.get(), function (idx, val) {

            type[val] = idx;
        });

        var data = [];
        Ext.Array.each(this.tokens, function (token, idx) {

            data.push({type : type[token.type], token : token.value });
        });

        return data;
    },

    makeRecords : function (fields, records) {

        var tmp = [];
        Ext.Array.each(records, function (row, ridx) {

            var record = {};
            Ext.Array.each(fields, function (col, cidx) {

                record[col.name] = row[cidx];
            });
            tmp.push(record);
        });

        return tmp;
    },

    makeListColumns : function () {   
        
        return [
            { text: 'Token Type', dataIndex: 'type', width : 100},
            { text: 'Token', dataIndex: 'token', flex : 1}
        ];
    }
});