Ext.define('Planche.controller.layout.ResultTabPanel', {
    extend: 'Ext.app.Controller',
    views : [
        'layout.MessageTab',
        'layout.TableDataTab',
        'layout.InfoTab',
        'layout.HistoryTab'
    ],
    timer : null,
    query : null,
    init  : function() {

        this.control({
            'result-tab-panel': {
                'initQueryResult': this.initQueryResult
            }
        });
    },

    loadGridRecord : function(cmd, db, callback){

        if (typeof cmd == 'undefined') { cmd = ''; }

        var me = this,
            app = me.getApplication();

        app.setLoading(true);

        app.tunneling({
            db     : db,
            query  : me.query['get' + cmd + 'SQL'](),
            success: function(config, response) {

                var data = app.makeRecords(response.fields, response.records),
                    textRows = me.grid.down('text[text=Total]').next();

                me.grid.store.loadData(data);
                me.grid.store.sync();

                textRows.setText(parseInt(response.affected_rows, 10));

                app.setLoading(false);

                if (callback) {

                    callback(cmd, db);
                }
            }
        });
    },

    initQueryResult: function(config, db, query, response) {

        config.tab = config.tab === true || true;

        this.query = query;

        var me = this,
            app = me.getApplication(),
            schema = response.fields, records = response.records,
            columns = [], fields = [], plugins = [{
                ptype: 'bufferedrenderer'
            }], grid,

            loadGridRecord = function(cmd, db) {

                me.loadGridRecord(cmd, db, function(){

                    var textRefreshPerSec = me.grid.down('text[text=Refresh Per Sec]').next(),
                        refreshPerSec = parseFloat(textRefreshPerSec.getValue());

                    if (refreshPerSec > 0) {

                        me.timer = setTimeout(loadGridRecord.bind(me, cmd, db), refreshPerSec * 1000);
                    }
                });
            },

            updateToolbar = function() {

                var textfield = grid.query('textfield'),
                    btnPrev = grid.down('button[text=Previous]'),
                    btnNext = grid.down('button[text=Next]'),
                    textRows = me.grid.down('text[text=Total]').next();

                btnNext.setDisabled(grid.store.data.length < query.end);
                btnPrev.setDisabled(1 > query.start);

                textfield[0].setValue(query.start);
                textfield[1].setValue(query.end);

                textRows.setText(grid.store.data.length);
            },

            colObjs = {};

        Ext.Array.each(schema, function(col, idx) {

            colObjs[col.name] = Ext.create('Ext.grid.column.Column', {
                text        : col.name,
                dataIndex   : col.name,
                listeners   : {
                    dblclick: function(view, el, ridx, cidx, event, data) {

                        app.openWindow('table.EditTextColumn', col.name, data.get(col.name));
                    }
                },
                hideable    : false,
                menuDisabled: true,
                draggable   : false,
                groupable   : false,
                renderer    : function(value){

                    if(value === null){

                        return '(NULL)';
                    }

                    return Ext.htmlEncode(value);
                },
                editor      : {
                    xtype: 'textfield'
                }
            });

            columns.push(colObjs[col.name]);

            fields.push(col.name);
        });

        var storeConfig = {
            fields    : fields,
            autoLoad  : false,
            pageSize  : 10,
            data      : app.makeRecords(schema, records),
            remoteSort: true,
            proxy     : {
                type  : 'memory',
                reader: {
                    type: 'json'
                }
            }
        };

        var orderColumn = null,
            orderColumnDir = 'ASC',
            isEditable = false;

        if (config.openTable) {

            Ext.apply(storeConfig, {
                sort: function(params) {

                    if (orderColumn != params.property) {

                        if (orderColumn != null) {

                            var column = colObjs[orderColumn];
                            column.removeCls('x-column-header-sort-DESC');
                            column.removeCls('x-column-header-sort-ASC');
                        }

                        orderColumnDir = orderColumn == null ? 'DESC' : 'ASC';
                        orderColumn = params.property;
                    }
                    else {

                        orderColumnDir = orderColumnDir == 'ASC' ? 'DESC' : 'ASC';
                    }

                    query.setOrderBy(orderColumn, orderColumnDir);

                    loadGridRecord();
                }
            });

            plugins.push({
                ptype       : 'cellediting',
                clicksToEdit: 1
            });

            isEditable = true;
        }

        var grid = this.grid = Ext.create('Ext.grid.Panel', Ext.Object.merge({
            border     : true,
            flex       : 1,
            columnLines: true,
            selModel   : {
                selType: 'checkboxmodel'
            },
            viewConfig : {
                emptyText: 'There are no items to show in this view.'
            },
            plugins    : plugins,
            tbar       : [{
                xtype   : 'button',
                text    : 'Add',
                icon    : 'resources/images/icon_add_row16x16.png',
                disabled: !isEditable,
                cls     : 'btn',
                handler : function(){

                    me.addRecord(db, config.openTable);
                }
            }, {
                xtype   : 'button',
                text    : 'Save',
                icon    : 'resources/images/icon_save_row16x16.png',
                disabled: !isEditable,
                cls     : 'btn',
                handler : function(){

                    me.saveChanges(db, config.openTable);
                }
            }, {
                xtype   : 'button',
                text    : 'Del',
                icon    : 'resources/images/icon_del_row16x16.png',
                disabled: !isEditable,
                cls     : 'btn',
                handler : function(){

                    me.delRecord(db, config.openTable);
                }
            }, {
                xtype : 'tbseparator',
                margin: '0 5 0 5'
            }, {
                xtype   : 'button',
                text    : 'Previous',
                icon    : 'resources/images/icon_prev16x16.png',
                cls     : 'btn',
                disalbed: true,
                handler : function(btn) {

                    loadGridRecord('PrevRecordSet');
                }
            }, {
                xtype    : 'textfield',
                value    : query.start,
                listeners: {
                    specialkey: function(field, el) {

                        if (el.getKey() == Ext.EventObject.ENTER) {

                            query.start = parseInt(field.getValue(), 10);
                            loadGridRecord();
                        }
                    }
                }
            }, {
                xtype   : 'button',
                text    : 'Next',
                icon    : 'resources/images/icon_next16x16.png',
                cls     : 'btn',
                disalbed: true,
                handler : function(btn) {

                    loadGridRecord('NextRecordSet');
                }
            }, {
                xtype : 'text',
                text  : 'Size',
                margin: '0 0 0 5'
            }, {
                xtype    : 'textfield',
                value    : query.end,
                width    : 80,
                margin   : '0 0 0 5',
                listeners: {
                    specialkey: function(field, el) {

                        if (el.getKey() == Ext.EventObject.ENTER) {

                            query.end = parseInt(field.getValue(), 10);
                            loadGridRecord();
                        }
                    }
                }
            }, {
                xtype : 'tbseparator',
                margin: '0 5 0 5'
            }, {
                xtype: 'text',
                text : 'Refresh Per Sec'
            }, {
                xtype    : 'textfield',
                value    : 0,
                width    : 40,
                margin   : '0 0 0 5',
                listeners: {
                    specialkey: function(field, el) {

                        if (el.getKey() == Ext.EventObject.ENTER) {

                            loadGridRecord();
                        }
                    }
                }
            }, {
                xtype  : 'button',
                text   : 'Refresh',
                icon   : 'resources/images/icon_refresh16x16.png',
                cls    : 'btn',
                margin : '0 0 0 5',
                handler: function(btn) {

                    clearTimeout(me.timer);
                    loadGridRecord();
                }
            }, {
                xtype  : 'button',
                text   : 'Stop',
                icon   : 'resources/images/icon_stop16x16.png',
                cls    : 'btn',
                margin : '0 0 0 5',
                handler: function(btn) {

                    clearTimeout(me.timer);
                    var textRefreshPerSec = grid.down('text[text=Refresh Per Sec]').next();
                    textRefreshPerSec.setValue(0);
                }
            }, {
                xtype : 'tbseparator',
                margin: '0 5 0 5'
            }, {
                xtype  : 'button',
                text   : 'Tokens',
                cls    : 'btn',
                handler: function(btn) {

                    app.openTokenPanel(query.getTokens());
                }
            }],
            fbar       : [
                {xtype: 'text', text: 'Total'},
                {xtype: 'text', text: '0', width: 50, rtl: true},
                {xtype: 'text', text: 'Rows'}
            ],
            remoteSort : true,
            store      : Ext.create('Ext.data.Store', storeConfig),
            columns    : columns
        }, config));

        grid.store.on('datachanged', function() {

            updateToolbar();
        });

        grid.on('sortchange', function() {

            if (!orderColumn) return;

            setTimeout(function() {

                var column = colObjs[orderColumn];

                if (orderColumnDir == 'ASC') {

                    column.removeCls('x-column-header-sort-DESC');
                    column.addCls('x-column-header-sort-ASC');
                }
                else {

                    column.removeCls('x-column-header-sort-ASC');
                    column.addCls('x-column-header-sort-DESC');
                }
            }, 100);
        });

        updateToolbar();

        if (config.openTable) {

            var tab = app.getActiveTableDataTab();

            Ext.apply(tab, {
                loadedTable: config.openTable
            });

            tab.removeAll();

            tab.show();
            tab.add(grid);
        }
        else {

            var resultTabPanel = app.getActiveResultTabPanel();

            resultTabPanel.add(grid);
            resultTabPanel.setActiveTab(grid);
        }
    },

    addRecord: function(btn) {

        var grid = this.grid,
            store = grid.store;

        store.add({});
        grid.scrollByDeltaY(999999);
    },

    saveChanges: function(db, table) {

        var me = this,
            app = me.getApplication(),
            api = app.getAPIS(),
            grid = this.grid,
            store = grid.store,
            selModel = grid.getSelectionModel(),
            selection = selModel.getSelection();

        if (selection.length == 0) {

            Ext.Msg.alert('info', 'Please, select one more rows to delete');
            return;
        }

        var tunnelings = [],
            messages = [];

        Ext.Array.each(store.getNewRecords(), function(record) {

            var fields = [],
                values = [];
            Ext.Object.each(record.data, function(key, value) {

                fields.push(key);

                if(value){

                    values.push('"' + value + '"');
                }
                else {

                    values.push('NULL');
                }

            });

            tunnelings.push({
                db     : db,
                query  : api.getQuery('INSERT_TABLE', db, table, fields.join(", "), values.join(", ")),
                success: function(config) {

                    messages.push(app.generateSuccessMsg(config.query, 'Records was successfully added'));
                },
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            });
        });

        Ext.Array.each(store.getUpdatedRecords(), function(record) {

            var where = [],
                changes = [];
            Ext.Object.each(record.raw, function(key, value) {

                if(value === null){

                    where.push(key + ' IS NULL');
                }
                else {

                    where.push(key + '="' + value + '"');
                }

                if (record.data[key] != value) {

                    changes.push(key + '="' + record.data[key] + '"');
                }
            });

            tunnelings.push({
                db     : db,
                query  : api.getQuery('UPDATE_TABLE', db, table, changes.join(", "), where.join(' AND ')),
                success: function(config) {

                    messages.push(app.generateSuccessMsg(config.query, 'Records was successfully updated'));
                },
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            });
        });

        if (tunnelings.length == 0) {

            Ext.Msg.alert('info', 'There\'s no changes');
            return;
        }

        app.tunnelings(tunnelings, {
            start  : function() {

                app.setLoading(true);
            },
            success: function() {

                //app.setLoading(false);
                //store.sync();

                me.loadGridRecord('', db);
            },
            failure: function() {

                app.openMessage(messages);
                app.setLoading(false);
            }
        });
    },

    delRecord: function(db, table) {

        var me = this,
            app = me.getApplication(),
            api = app.getAPIS(),
            grid = this.grid,
            store = grid.store,
            selModel = grid.getSelectionModel(),
            selection = selModel.getSelection();

        if (selection.length == 0) {

            Ext.Msg.alert('info', 'Please, select one more rows to delete');
            return;
        }

        var tunnelings = [],
            messages = [];
        Ext.Array.each(selection, function(record) {

            var where = [];
            Ext.Object.each(record.raw, function(key, value) {

                if(value === null){

                    where.push(key + ' IS NULL');
                }
                else {

                    where.push(key + '="' + value + '"');
                }
            });

            tunnelings.push({
                db     : db,
                query  : api.getQuery('DELETE_TABLE', db, table, where.join(' AND ')),
                success: function(config) {

                    messages.push(app.generateSuccessMsg(config.query, 'Records was successfully removed'));
                },
                failure: function(config, response) {

                    messages.push(app.generateError(config.query, response.message));
                }
            });
        });

        app.tunnelings(tunnelings, {
            start  : function() {

                app.setLoading(true);
            },
            success: function() {

                app.setLoading(false);
                store.remove(selection);
                //store.sync();

                me.loadGridRecord('', db, function(){

                    app.setLoading(false);
                });
            },

            failure: function() {

                app.openMessage(messages);
                app.setLoading(false);
            }
        });
    }
});