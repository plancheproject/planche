Ext.define('Planche.controller.table.EditIndexWindow', {
    extend: 'Ext.app.Controller',
    views : [
        'table.EditIndexWindow'
    ],
    init : function () {

        this.control({
            '#edit-index-btn-save' : {
                'click' : this.save
            },
            '#edit-index-btn-close' : {
                'click' : this.cancel
            },
            '#edit-index-grid' : {
                'boxready' : this.initGrid,
                'cellclick' : this.selectField,
            }
        });
    },

    initWindow : function (db, tb, index) {

        var title = (index ? 'Alter Index \''+index+'\' in `'+db+'`.`'+tb+'`' : 'Create new index');

        Ext.create('Planche.view.table.EditIndexWindow', {
            title    : title,
            database : db,
            table    : tb,
            indexName: index
        });
    },

    initGrid : function (grid) {

        var
        app       = this.getApplication(),
        win       = grid.up("window"),
        index     = Ext.getCmp('edit-index-name'),
        option    = Ext.getCmp('edit-index-option'),
        indexName = win.getIndexName(),
        db        = win.getDatabase(),
        tb        = win.getTable(),
        queries   = [],
        editMode  = false,
        me        = this,
        optionVal  = '',
        getMatch = function (str, pattern, idx) {

            var r = str.match(pattern);
            if (r) r = r[idx];
            return r;
        };

        if(!tb) {

            return;
        }

        if(indexName) {

            editMode = true;
            index.setValue(indexName);
            queries.push(app.getAPIS().getQuery('INDEX_KEYS_INFO', db, tb, indexName));
        }

        win.setLoading(true);

        queries.push(app.getAPIS().getQuery('SHOW_FULL_FIELDS', db, tb));

        app.multipleTunneling(db, queries, {
            failureQuery   : function (idx, query, config, response) {

                messages.push(app.generateError(query, response.message));
            },
            afterAllQueries : function (queries, results) {

                var columns = {};

                if(editMode){

                    var records = app.getAssocArray(results[0].response.fields, results[0].response.records);

                    Ext.Array.each(records, function(obj, idx){

                        if(obj.Non_unique == '0'){

                            optionVal = 'UNIQUE';
                        }

                        if(obj.Index_type == 'FULLTEXT'){

                            optionVal = 'FULLTEXT';
                        }

                        columns[obj.Column_name] = {
                            len : obj.Sub_part
                        };
                    });


                    var result  = results[1].response.records,
                        records = [];
                    Ext.Object.each(result, function (idx, row) {

                        var
                            type     = getMatch(row[1], /[a-zA-Z]+/, 0),
                            len      = getMatch(row[1], /\((.*)\)/, 1),
                            unsigned = getMatch(row[1], /unsigned/, 0),
                            zerofill = getMatch(row[1], /zerofill/, 0);

                        records.push({
                            'field'    : row[0],
                            'type'     : type,
                            'comment'  : row[8],
                            'use'      : false,
                            'sort'     : null,
                            'length'   : null
                        });
                    });

                    Ext.Array.each(records, function(obj, idx){

                        if(columns[obj.field]){

                            records[idx].use = true;
                        }
                    });

                    me.loadColumns(records);

                    option.setValue({'edit-index-option': optionVal});
                }

                win.setLoading(false);
            }
        });
    },

    loadColumns : function (records) {

        var grid = Ext.getCmp('edit-index-grid');

        grid.getStore().loadData(records);

    },

    selectField : function( grid, td, cellIndex, record, tr, rowIndex, e, eOpts ){

        if(cellIndex < 3) {

            record.set('use', !record.get('use'));
        }
    },

    save : function () {

        var
        app          = this.getApplication(),
        index        = Ext.getCmp('edit-index-name'),
        indexName    = index.getValue(),
        win          = Ext.getCmp('edit-index-window'),
        tab          = Ext.getCmp('table-indexes-tab'),
        db           = win.getDatabase(),
        tb           = win.getTable(),
        oldIndexName = win.getIndexName(),
        grid         = Ext.getCmp('edit-index-grid'),
        store        = grid.getStore(),
        list         = store.getRange(),
        queries      = [],
        option       = Ext.getCmp('edit-index-option'),
        optionValue  = option.getValue()['edit-index-option'],
        using        = Ext.getCmp('edit-index-using'),
        usingValue   = using.getValue()['edit-index-using'],
        columns      = [],
        messages     = [];

        if(!indexName) {

            index.markInvalid('Please input index name');
            return;
        }

        Ext.Array.each(list, function (obj, idx) {

            var d = obj.data;

            if(d.use) {

                var column = d.field;

                if(d.length) {

                    column = column + '('+d.length+')';
                }

                if(d.sort) {

                    column = column + ' ' + d.sort;
                }

                columns.push(column);
            }
        });

        if(oldIndexName) {

            queries.push(app.getAPIS().getQuery('DROP_INDEX', db, tb, oldIndexName));
        }

        if(optionValue != 'FULLTEXT'){

            usingValue = "USING " + usingValue;
        }
        else {

            usingValue = '';
        }

        var query = app.getAPIS().getQuery('ADD_INDEX', db, tb, indexName, optionValue, columns.join(","), usingValue);

        queries.push(query);

        win.setLoading(true);

        app.multipleTunneling(db, queries, {
            failureQuery   : function (idx, query, config, response) {

                messages.push(app.generateError(query, response.message));
            },
            afterAllQueries : function (queries, results) { 

                win.setLoading(false);

                if(messages.length > 0) {

                    app.showMessage(messages);
                    return;
                }

                
                tab.fireEvent('reload', tab);

                win.destroy();
            }
        });
    },

    cancel : function (btn) {

        var win = Ext.getCmp('edit-index-window');

        win.destroy();
    }
});