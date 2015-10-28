Ext.define('Planche.controller.table.EditIndexWindow', {
    extend: 'Ext.app.Controller',
    views : [
        'table.EditIndexWindow'
    ],
    init  : function() {

        this.control({
            '#edit-index-btn-save' : {
                'click': this.save
            },
            '#edit-index-btn-close': {
                'click': this.cancel
            },
            '#edit-index-grid'     : {
                'boxready' : this.initGrid,
                'cellclick': this.selectField
            }
        });
    },

    initWindow: function(db, table, index) {

        var title = (index ? 'Alter Index \'' + index + '\' in `' + db + '`.`' + table + '`' : 'Create new index');

        Ext.create('Planche.view.table.EditIndexWindow', {
            title    : title,
            database : db,
            table    : table,
            indexName: index
        });
    },

    initGrid: function(grid) {

        var app = this.getApplication(),
            win = grid.up("window"),
            index = Ext.getCmp('edit-index-name'),
            option = Ext.getCmp('edit-index-option'),
            indexName = win.getIndexName(),
            db = win.getDatabase(),
            table = win.getTable(),
            me = this,
            getMatch = function(str, pattern, idx) {

                var r = str.match(pattern);
                if (r) r = r[idx];
                return r;
            };

        if (!table) {

            return;
        }

        var columns = {},
            records = [],
            messages = [],
            tunnelings = [],
            editMode = false;

        tunnelings.push({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_FULL_FIELDS', db, table),
            success: function(config, response) {

                Ext.Object.each(response.records, function(idx, row) {

                    var type = getMatch(row[1], /[a-zA-Z]+/, 0),
                        len = getMatch(row[1], /\((.*)\)/, 1),
                        unsigned = getMatch(row[1], /unsigned/, 0),
                        zerofill = getMatch(row[1], /zerofill/, 0);

                    records.push({
                        'field'  : row[0],
                        'type'   : type,
                        'comment': row[8],
                        'use'    : false,
                        'sort'   : null,
                        'length' : null
                    });
                });
            },
            failure: function(config, response) {

                messages.push(app.generateError(config.query, response.message));
            }
        });

        if (indexName) {

            editMode = true;
            index.setValue(indexName);

            tunnelings.push({
                db     : db,
                query  : app.getAPIS().getQuery('INDEX_KEYS_INFO', db, table, indexName),
                success: function(config, response) {

                    var records = Planche.DBUtil.getAssocArray(response.fields, response.records),
                        optionVal = '';

                    Ext.Array.each(records, function(row, idx) {

                        if (row.Non_unique == '0') {

                            optionVal = 'UNIQUE';
                        }

                        if (row.Index_type == 'FULLTEXT') {

                            optionVal = 'FULLTEXT';
                        }

                        columns[row.Column_name] = {
                            len: row.Sub_part
                        };
                    });

                    option.setValue({'edit-index-option': optionVal});
                },
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            });
        }

        app.tunnelings(tunnelings, {
            start  : function() {

                win.setLoading(true);
            },
            success: function() {

                if (editMode) {

                    Ext.Array.each(records, function(obj, idx) {

                        if (columns[obj.field]) {

                            records[idx].use = true;
                        }
                    });
                }

                me.loadColumns(records);
                win.setLoading(false);
            },
            failure: function() {

                app.showMessage(messages);
                win.setLoading(false);
            }
        });
    },

    loadColumns: function(records) {

        var grid = Ext.getCmp('edit-index-grid');

        grid.getStore().loadData(records);

    },

    selectField: function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {

        if (cellIndex < 3) {

            record.set('use', !record.get('use'));
        }
    },

    save: function() {

        var app = this.getApplication(),
            win = Ext.getCmp('edit-index-window'),
            tab = Ext.getCmp('table-indexes-tab'),
            grid = Ext.getCmp('edit-index-grid'),
            index = Ext.getCmp('edit-index-name'),
            using = Ext.getCmp('edit-index-using'),
            usingValue = using.getValue()['edit-index-using'],
            option = Ext.getCmp('edit-index-option'),
            optionValue = option.getValue()['edit-index-option'],
            indexName = index.getValue(),
            db = win.getDatabase(),
            table = win.getTable(),
            oldIndexName = win.getIndexName(),
            store = grid.getStore(),
            list = store.getRange(),
            tunnelings = [],
            columns = [],
            messages = [];

        if (!indexName) {

            index.markInvalid('Please input index name');
            return;
        }

        Ext.Array.each(list, function(obj, idx) {

            var d = obj.data;

            if (d.use) {

                var column = d.field;

                if (d.length) {

                    column = column + '(' + d.length + ')';
                }

                if (d.sort) {

                    column = column + ' ' + d.sort;
                }

                columns.push(column);
            }
        });

        if (oldIndexName) {

            tunnelings.push({
                db     : db,
                query  : app.getAPIS().getQuery('DROP_INDEX', db, table, oldIndexName),
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            });
        }

        usingValue = optionValue != 'FULLTEXT' ? "USING " + usingValue : usingValue;
        tunnelings.push({
            db     : db,
            query  : app.getAPIS().getQuery('ADD_INDEX', db, table, indexName, optionValue, columns.join(","), usingValue),
            failure: function(config, response) {

                messages.push(app.generateError(config.query, response.message));
            }
        });

        app.tunnelings(tunnelings, {
            start  : function() {

                win.setLoading(true);
            },
            success: function() {

                if(tab){

                    tab.fireEvent('reload', tab);
                }

                win.setLoading(false);
                win.destroy();
            },
            failure: function() {

                app.showMessage(messages);
                win.setLoading(false);
            }
        });
    },

    cancel: function() {

        var win = Ext.getCmp('edit-index-window');
        win.destroy();
    }
});