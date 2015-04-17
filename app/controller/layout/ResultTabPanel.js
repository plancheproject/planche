Ext.define('Planche.controller.layout.ResultTabPanel', {
    extend: 'Ext.app.Controller',
    views : [
        'layout.MessageTab',
        'layout.TableDataTab',
        'layout.InfoTab',
        'layout.HistoryTab'
    ],
    init : function () {

        this.control({
            'result-tab-panel' : {
                'initQueryResult' : this.initQueryResult
            }
        });
    },

    initQueryResult : function (config, db, query, response) {

        config.tab = config.tab === true || true;

        var 
        app        = this.getApplication(),
        connectTab = app.getActiveConnectTab(),
        
        scheme     = response.fields, records = response.records,
        columns    = [], fields = [], grid,

        loadGridRecord = function (cmd) {

            if(typeof cmd == 'undefined') { cmd = ''; }
    
            var textRows = grid.down('text[text=Total]').next();
            var textRefreshPerSec = grid.down('text[text=Refresh Per Sec]').next();

            var refreshPerSec = parseFloat(textRefreshPerSec.getValue());

            textRows.setText('0');
            
            connectTab.setLoading(true);

            app.tunneling({
                db : db,
                query : query['get'+cmd+'SQL'](),
                success : function (config, response) {

                    var data = app.makeRecords(scheme, response.records);              
                    grid.store.loadData(data);
                    connectTab.setLoading(false);

                    if(refreshPerSec > 0) {

                        setTimeout(loadGridRecord, refreshPerSec * 1000);
                    }
                }
            });

        },

        updateToolbar = function () {

            var textfield = grid.query('textfield'), btnPrev = grid.down('button[text=Previous]'), 
                btnNext = grid.down('button[text=Next]'), textRows = grid.down('text[text=Total]').next();

            btnNext.setDisabled(grid.store.data.length < query.end);
            btnPrev.setDisabled(1 > query.start);

            textfield[0].setValue(query.start);
            textfield[1].setValue(query.end);

            textRows.setText(grid.store.data.length);
        },

        colObjs = {};

        Ext.Array.each(scheme, function (col, idx) {

            colObjs[col.name] = Ext.create('Ext.grid.column.Column',{
                text: col.name,
                dataIndex: col.name,
                listeners : {
                    dblclick :function (view, el, ridx, cidx, event, data) {

                        if(['blob', 'var_string'].indexOf(col.type) > -1) {

                            app.openWindow('table.EditTextColumn', data.get(col.name));
                        }
                    }
                },
                hideable : false,
                menuDisabled: true,
                draggable: false,
                groupable: false,
                renderer : 'htmlEncode'
            });

            columns.push(colObjs[col.name]);

            fields.push(col.name);
        });

        var storeConfig = {
            fields: fields,
            autoLoad : false,
            pageSize: 10,
            data : app.makeRecords(scheme, records),
            remoteSort: true,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            }
        };

        var orderColumn    = null,
            orderColumnDir = 'ASC';

        if(config.openTable) {

            Ext.apply(storeConfig, {
                sort : function (params) {

                    if(orderColumn != params.property) {

                        if(orderColumn != null) {

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
        }
        
        var grid = Ext.create('Ext.grid.Panel', Ext.Object.merge({
            xtype   : 'grid',
            border  : true,
            flex    : 1,
            columnLines: true,
            selModel : {
                selType : 'checkboxmodel'
            },
            viewConfig: { 
                emptyText : 'There are no items to show in this view.' 
            },
            plugins: {
                ptype: 'bufferedrenderer'
            },
            tbar: [
                { xtype: 'button', text: 'Add', disabled: true, cls : 'btn', handler : function (btn) {

                }},
                { xtype: 'button', text: 'Save', disabled: true, cls : 'btn', handler : function (btn) {

                }},
                { xtype: 'button', text: 'Del', disabled: true, cls : 'btn', handler : function (btn) {

                }},
                { xtype: 'tbseparator', margin : '0 5 0 5'},
                { xtype: 'button', text: 'Previous', cls : 'btn', disalbed : true, handler : function (btn) {

                    loadGridRecord('PrevRecordSet');
                }},
                { xtype: 'textfield', value: query.start, listeners : {
                    specialkey: function (field, el) {

                        if (el.getKey() == Ext.EventObject.ENTER) {
                            
                            query.start = parseInt(field.getValue(), 10);
                            loadGridRecord();
                        }
                    }
                }},
                { xtype: 'button', text: 'Next', cls : 'btn', disalbed : true, handler : function (btn) {

                    loadGridRecord('NextRecordSet');
                }},
                { xtype: 'text', text: 'Size', margin : '0 0 0 5' },
                { xtype: 'textfield', value: query.end, width : 80, margin : '0 0 0 5', listeners : {
                    specialkey: function (field, el) {

                        if (el.getKey() == Ext.EventObject.ENTER) {

                            query.end = parseInt(field.getValue(), 10);
                            loadGridRecord();
                        }
                    }
                }},
                { xtype: 'tbseparator', margin : '0 5 0 5'},
                { xtype: 'text',  text : 'Refresh Per Sec'},
                { xtype: 'textfield', value: 0, width : 40, margin : '0 0 0 5', listeners : {
                    specialkey: function (field, el) {

                        if (el.getKey() == Ext.EventObject.ENTER) {

                            loadGridRecord();
                        }
                    }
                }},
                { xtype: 'button', text: 'Refresh', cls : 'btn', margin : '0 0 0 5', handler : function (btn) {

                    loadGridRecord();
                }},
                { xtype: 'button', text: 'Stop', cls : 'btn', margin : '0 0 0 5', handler : function (btn) {

                    var textRefreshPerSec = grid.down('text[text=Refresh Per Sec]').next();

                    textRefreshPerSec.setValue(0);
                }},
                { xtype: 'tbseparator', margin : '0 5 0 5'},
                { xtype: 'button', text: 'Tokens', cls : 'btn', handler : function (btn) {

                    app.openTokenPanel(query.getTokens());
                }}
            ],
            fbar : [
                { xtype: 'text', text: 'Total' },
                { xtype: 'text', text: '0', width : 50, rtl: true },
                { xtype: 'text', text: 'Rows' }
            ],
            remoteSort: true,
            store   : Ext.create('Ext.data.Store', storeConfig),
            columns : columns
        }, config));
        
        grid.store.on('datachanged', function () {

            updateToolbar();
        });

        grid.on('sortchange', function () {

            if(!orderColumn) return;
            
            setTimeout(function () {

                var column = colObjs[orderColumn];

                if(orderColumnDir == 'ASC') {

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

        if(config.openTable) {

            var tab = app.getActiveTableDataTab();

            Ext.apply(tab, {
                loadedTable : config.openTable
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
    }
});