Ext.define('Planche.controller.table.EditIndexWindow', {
    extend: 'Ext.app.Controller',
    views : [
        'table.EditIndexWindow'
    ],
    init : function(){

        this.control({
            '#edit-index-btn-save' : {
                'click' : this.save
            },
            '#edit-index-btn-close' : {
                'click' : this.cancel
            },
            '#edit-index-grid' : {
                'boxready' : this.initGrid
            }
        });
    },

    initWindow : function(db, tb, index){

        var indexName = null;

        if(index) {

            indexName = index.data.Key_name;
        }

        var title = (index ? 'Alter Index \''+indexName+'\' in `'+db+'`.`'+tb+'`' : 'Create new index');

        Ext.create('Planche.view.table.EditIndexWindow', {
            title    : title,
            database : db,
            table    : tb,
            indexName: indexName
        });
    },

    initGrid : function(grid){

        var 
        app      = this.getApplication(),
        win      = grid.up("window"),
        db       = win.getDatabase(),
        tb       = win.getTable(),
        getMatch = function(str, pattern, idx){ 

            var r = str.match(pattern); 
            if(r) r = r[idx];
            return r;
        },
        records = [];

        if(!tb){

            return;
        }

        //load table fileds list
        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_FULL_FIELDS', db, tb),
            success: function(config, response){

                Ext.Object.each(response.records, function(idx, row){

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

                grid.getStore().loadData(records);
            }
        });
    },

    save : function(){

        var
        app       = this.getApplication(),
        index     = Ext.getCmp('edit-index-name').getValue(),
        win       = Ext.getCmp('edit-index-window'),
        tab       = Ext.getCmp('table-indexes-tab'),
        db        = win.getDatabase(),
        tb        = win.getTable(),
        indexName = win.getIndexName(),
        grid      = Ext.getCmp('edit-index-grid'),
        store     = grid.getStore(),
        list      = store.getRange(),
        queries   = [];

        var columns = [];
        Ext.Array.each(list, function(obj, idx){

            var d = obj.data;

            if(d.use){

                var column = d.field;

                if(d.length){

                    column = column + '('+d.length+')';
                }

                if(d.sort){

                    column = column + ' ' + d.sort;
                }

                columns.push(column);
            }
        });

        if(indexName){

            queries.push(app.getAPIS().getQuery('DROP_INDEX', db, tb, indexName));
        }

        // var option = 'FULLTEXT';
        var option = '';
        queries.push(app.getAPIS().getQuery('ADD_INDEX', db, tb, index, columns.join(","), option, 'BTREE'));

        var messages = [];

        win.setLoading(true);

        app.multipleTunneling(db, queries, {
            failureQuery   : function(idx, query, config, response){

                messages.push(app.generateError(query, response.message));
            },
            afterAllQueries : function(queries, results){ 

                win.setLoading(false);

                if(messages.length > 0){

                    app.showMessage(messages);
                    return;
                }

                
                tab.fireEvent('reload', tab);

                win.destroy();
            }
        });
    },

    cancel : function(btn){

        var win = Ext.getCmp('edit-index-window');

        win.destroy();
    }
});