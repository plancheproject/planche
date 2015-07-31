Ext.define('Planche.controller.table.ReorderColumns', {
    extend: 'Ext.app.Controller',

    initWindow: function(db, tb, result) {

        Ext.create('Planche.lib.Window', {
            stateful  : true,
            title     : 'Reorder columns \'' + tb + '\' in \'' + db + '\'',
            layout    : 'fit',
            bodyStyle : "background-color:#FFFFFF",
            width     : 400,
            height    : 300,
            overflowY : 'auto',
            autoScroll: true,
            modal     : true,
            plain     : true,
            fixed     : true,
            shadow    : false,
            autoShow  : true,
            constrain : true,
            items     : this.initGrid(),
            buttons   : [{
                text   : 'Up',
                scope  : this,
                handler: this.up
            }, {
                text   : 'Down',
                scope  : this,
                handler: this.down
            }, {
                text   : 'Save',
                scope  : this,
                handler: this.save
            }, {
                text   : 'Close',
                scope  : this,
                handler: this.close
            }],
            listeners : {
                scope   : this,
                boxready: function() {

                    this.initTableData(result);
                }
            }
        });
    },

    initGrid: function() {

        var columns = this.makeListColumns(),
            fields = [];

        Ext.each(columns, function(obj) {

            fields.push(obj.dataIndex);
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            id         : 'reorder-columns-grid',
            border     : false,
            columnLines: true,
            width      : '100%',
            flex       : 1,
            columns    : columns,
            store      : Ext.create('Ext.data.Store', {
                fields: fields
            })
        });

        return this.grid;
    },


    initTableData: function(result) {

        var store = this.grid.getStore(),
            records = [];

        Ext.Object.each(result.records, function(idx, row) {

            records.push({
                field: row[0],
                type : row[1]
            });
        });
        store.insert(0, records);
    },

    makeListColumns: function() {

        return [
            {text: 'Field', dataIndex: 'field', width: 120},
            {text: 'Type', dataIndex: 'type', flex: 1}
        ];
    },

    up: function(btn) {

        this.moveSelectedRow('up');
    },

    down: function(btn) {

        this.moveSelectedRow('down');
    },

    save: function(btn) {

        var app = this.getApplication(),
            api = app.getAPIS(),
            db = app.getSelectedDatabase(),
            tb = app.getSelectedTable(),
            grid = Ext.getCmp('reorder-columns-grid'),
            selection = grid.selModel.getSelection();

        app.tunneling({
            db     : db,
            query  : api.getQuery('SHOW_CREATE_TABLE', db, tb),
            success: function(config, response) {

                var row = Planche.DBUtil.getAssocArray(response.fields, response.records)[0],
                    lines = row["Create Table"].split("\n"),
                    fields = {};

                lines.shift();
                lines.pop();

                lines.map(function(line, idx) {

                    var line = Ext.String.trim(line),
                        pos = line.indexOf(" "),
                        field = line.substring(0, pos),
                        options = line.substring(pos + 1, line.length - 1);

                    fields[field] = options;
                });

                var columns = [],
                    prevField = null;
                grid.store.getRange().map(function(row, idx) {

                    var field = row.raw.field,
                        position = (idx == 0 ? "FIRST" : "AFTER " + prevField);
                    columns.push("MODIFY COLUMN " + field + " " + fields["`"+field+"`"] + " " + position);
                    prevField = field;
                });

                app.tunneling({
                    db     : db,
                    query  : api.getQuery("ALTER_TABLE", db, tb, columns.join(",")),
                    success: function(config, response) {

                        Ext.Msg.alert('info', 'Successfully reordered');
                        btn.up('window').destroy();
                    }
                });
            },
            failure: function(config, response) {

                app.generateQueryErrorMsg(config.query, response.message);
                btn.up('window').destroy();
            }
        });


    },

    close: function(btn) {

        btn.up('window').destroy();
    },

    moveSelectedRow: function(direction) {

        var record = this.grid.getSelectionModel().getSelection()[0],
            index = this.grid.getStore().indexOf(record);

        if (!record) {
            return;
        }

        if (direction === 'up') {
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