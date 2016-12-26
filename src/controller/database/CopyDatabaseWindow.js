Ext.define('Planche.controller.database.CopyDatabaseWindow', {
    extend: 'Planche.lib.SchemaTree',
    views : [
        'Planche.view.database.CopyDatabaseWindow',
        'Planche.view.database.DatabaseSchemaTree'
    ],
    config: {
        tablesChildren: []
    },
    progressNum : 0,
    init  : function() {

        this.initCopy();

        var app = this.getApplication();

        this.control({
            '#copy-database-source-tree': {
                beforeitemexpand: function(node) {

                    var selType = app.getSelectedNode(true).raw.type;

                    this.expandTree(node, {
                        checked: selType === 'database'
                    });
                },
                show            : app.setSelectedTree,
                reloadTree      : function(node) {

                    var selType = app.getSelectedNode(true).raw.type;

                    this.reloadTree(node, {
                        checked: selType === 'database'
                    });
                },
                expandTree      : function(node) {

                    var selType = app.getSelectedNode(true).raw.type;

                    this.expandTree(node, {
                        checked: selType === 'database'
                    });
                },
                iteminsert : function(node){

                    var selNode = app.getSelectedNode(true);
                    Ext.Array.each(node.childNodes, function(child, idx){

                        if(child.raw.text == selNode.raw.text || selNode.raw.type == 'tables'){

                            child.set('checked', true);
                            child.save();
                        }
                    });
                },
                boxready        : function(tree) {

                    var me = this,
                        task = new Ext.util.DelayedTask(),
                        node = tree.getRootNode(),
                        db = app.getSelectedDatabase(),
                        table = app.getSelectedTable();

                    node.set('text', db);

                    task.delay(100, function() {

                        tree.getSelectionModel().select(node);

                        me.loadTree(node, {
                            checked: false
                        });

                        Ext.Array.each(node.childNodes, function(child, idx){

                            var checked = false;

                            if(!table){

                                checked = true;
                            }

                            me.expandTree(child, {
                                checked: checked
                            });

                            child.expand();
                        });
                    });
                }
            },
            '#copy-database-target-grid': {
                boxready: function(grid) {

                    var connectTabPanel = app.getConnectTabPanel(),
                        connectTabs = connectTabPanel.query('connect-tab');

                    if (connectTabs === 0) {

                        return;
                    }

                    var record = [];
                    connectTabs.map(function(tab) {

                        if (tab.id === app.getActiveConnectTab().id) {

                            return;
                        }

                        var tree = tab.child('treepanel'),
                            root = tree.getRootNode();

                        root.childNodes.map(function(node) {

                            record.push({
                                connection: tab.title,
                                database  : node.data.text,
                                tab       : tab
                            });
                        });
                    });


                    grid.store.loadData(record);
                },

                select : function(view, record){

                    var reqType = window.location.protocol == 'file:' ? 'jsonp' : record.raw.tab.getRequestType(),
                        isJSONP = reqType === 'jsonp';

                    Ext.getCmp('copy-database-option-3').setDisabled(isJSONP);
                    Ext.getCmp('copy-database-option-3').setValue(!isJSONP);
                }
            },
            '#copy-database-btn-copy'   : {
                click: this.copy
            },
            '#copy-database-btn-close'  : {
                click: this.close
            }
        });

        this.callParent(arguments);
    },

    initWindow: function(type, name) {

        var app = this.getApplication();

        Ext.create('Planche.view.database.CopyDatabaseWindow', {
            database   : app.getSelectedDatabase(),
            application: app
        });
    },

    initCopy: function() {

        this.messages = [];
        this.queue = [];
        this.tableInfo = {};
        this.selectedTarget = [];
        this.copyPerOnce = 1;
    },

    copy: function(btn) {

        this.initCopy();

        var app = this.getApplication(),
            api = app.getAPIS(),
            me = this,
            source = this.getSelectedSource(),
            target = this.getSelectedTarget();

        if (!source) {

            Ext.Msg.alert('info', 'Please select a source');
            return;
        }

        if (!target) {

            Ext.Msg.alert('info', 'Please select a target');
            return;
        }

        btn.setDisabled(true);

        var wait1second = function(callback){

            setTimeout(function(){

                callback(null);
            }, 1000);
        };

        async.waterfall([
            Ext.Function.bind(me.dropExistsTarget, me),
            wait1second,
            Ext.Function.bind(me.getSourceStructure, me),
            Ext.Function.bind(me.copySourceStructure, me),
            wait1second,
            Ext.Function.bind(me.getTotalRecord, me),
            Ext.Function.bind(me.copyTableData, me),
            wait1second
        ], function (err, queues) {

            if(err) {

                me.failure(err);
                return;
            }

            me.finish();
        });
    },

    getTotalSource : function(){

        var me = this,
            source = me.getSelectedSource(),
            total = 0,
            get = function(type) { return (source[type] || []).length; };

        return get('table') + get('view') + get('procedure') + get('function') + get('trigger') + get('event');
    },

    dropExistsTarget : function(callback){

        var me = this,
            options = this.getCopyOptions();

        //Drop if exists in target
        if (options['copy-database-option-2'] !== 'on') {

            callback(null);
            return;
        }

        me.progressNum = 0;
        me.progressTotal = me.getTotalSource();

        async.series([
            me._dropExistsTarget('table'),
            me._dropExistsTarget('view'),
            me._dropExistsTarget('procedure'),
            me._dropExistsTarget('function'),
            me._dropExistsTarget('trigger'),
            me._dropExistsTarget('event')
        ], function (err, results) {

            if(err) {

                callback(err);
                return;
            }

            callback(null);
        });
    },

    _dropExistsTarget : function(type){

        var me = this,
            tunnelings = [],
            app = this.getApplication(),
            api = app.getAPIS(),
            source = this.getSelectedSource(),
            target = this.getSelectedTarget(),
            progress = this.getProgressBox();

        var queries = [];
        Ext.Array.each(source[type] || [], function(src, idx) {

            tunnelings.push({
                db         : target.db,
                query      : api.getQuery('DROP_' + type.toUpperCase(), target.db, src, 'IF EXISTS'),
                connection : target.connection,
                success    : function(config, response) {

                    me.updateProgress(me.progressNum, me.progressTotal, 'Drop exists target..');
                    me.progressNum++;
                }
            });
        });

        return function(callback){

            if(tunnelings.length == 0) {

                callback(null);
                return;
            }

            app.tunnelings(tunnelings, {
                success: function() {

                    callback(null);
                },
                failure: function(config, response) {

                    callback(app.generateQueryErrorMsg(config.query, response.message));
                }
            });
        }
    },

    getSourceStructure : function(callback){

        var me = this;

        me.progressNum = 0;
        me.progressTotal = me.getTotalSource();

        async.series({
            'table'     : me._getSourceStructure('table'),
            'view'      : me._getSourceStructure('view'),
            'procedure' : me._getSourceStructure('procedure'),
            'function'  : me._getSourceStructure('function'),
            'trigger'   : me._getSourceStructure('trigger'),
            'event'     : me._getSourceStructure('event')
        }, function (err, structures) {

            if(err) {

                callback(err);
                return;
            }

            callback(null, structures);
        });
    },

    _getSourceStructure : function(type){

        var me = this,
            app = this.getApplication(),
            source = this.getSelectedSource(),
            app = this.getApplication(),
            api = app.getAPIS(),
            target = this.getSelectedTarget();

        var structures = [],
            tunnelings = [];
        Ext.Array.each(source[type] || [], function(src, idx) {

            tunnelings.push({
                db         : source.db,
                query      : api.getQuery('SHOW_CREATE_' + type.toUpperCase(), source.db, src),
                connection : source.connection,
                success    : function(config, response) {

                    var row = Planche.DBUtil.getAssocArray(response.fields, response.records)[0];

                    //get table structure
                    if(type == 'trigger'){

                        var structure = row['SQL Original Statement'];
                    }
                    else {

                        var structure = row['Create ' + type[0].toUpperCase() + type.slice(1)];
                    }

                    structures.push([ type, src, structure ]);

                    me.updateProgress(me.progressNum, me.progressTotal, 'Get structures from source');
                    me.progressNum++;
                }
            });
        });

        return function(callback){

            if(tunnelings.length == 0) {

                callback(null, structures);
                return;
            }

            app.tunnelings(tunnelings, {
                success: function() {

                    callback(null, structures);
                },
                failure: function(config, response) {

                    callback(app.generateQueryErrorMsg(config.query, response.message));
                }
            });
        }
    },

    copySourceStructure : function(structures, callback){

        var me = this,
            progress = me.getProgressBox();

        me.progressNum = 0;
        me.progressTotal = me.getTotalSource();

        async.series([
            me._copySourceStructure(structures['table']),
            me._copySourceStructure(structures['view']),
            me._copySourceStructure(structures['procedure']),
            me._copySourceStructure(structures['function']),
            me._copySourceStructure(structures['trigger']),
            me._copySourceStructure(structures['event'])
        ], function (err, results) {

            if(err) {

                callback(err);
                return;
            }

            callback(null);
        });
    },

    _copySourceStructure : function(structures, callback){

        var me = this,
            app = this.getApplication(),
            api = app.getAPIS(),
            source = this.getSelectedSource(),
            target = this.getSelectedTarget(),
            progress = me.getProgressBox();

        var tunnelings = [];
        Ext.Array.each(structures, function(structure, idx) {

            var type = structure[0],
                src = structure[1],
                query = structure[2];

            tunnelings.push({
                db         : target.db,
                query      : query,
                connection : target.connection,
                success    : function(config, response) {

                    me.updateProgress(me.progressNum, me.progressTotal, 'Copy structures to target');
                    me.progressNum++;
                }
            });
        });

        return function(callback){

            if(tunnelings.length == 0) {

                callback(null);
                return;
            }

            app.tunnelings(tunnelings, {
                success: function() {

                    callback(null);
                },
                failure: function(config, response) {

                    callback(app.generateQueryErrorMsg(config.query, response.message));
                }
            });
        }
    },

    getTotalRecord : function(callback){

        var me = this,
            source = this.getSelectedSource(),
            options = this.getCopyOptions();

        if (options['copy-database-option-1'] === 2) {

            callback(null, {});
            return;
        }

        me.progressNum = 0;
        me.progressTotal = me.getTotalSource();

        var tables = source.table || [],
            tasks = {};
        Ext.Array.each(tables, function(table, idx) {

            tasks[table] = me._getTotalRecord(table);
        });

        async.series(tasks, function (err, tables) {

            if(err) {

                callback(err);
                return;
            }

            callback(null, tables);
        });
    },

    _getTotalRecord: function(table){

        var me = this,
            app = this.getApplication(),
            api = app.getAPIS(),
            source = this.getSelectedSource(),
            progress = me.getProgressBox();

        return function(callback){

            app.tunneling({
                connection: source.connection,
                db        : source.db,
                query     : api.getQuery('SELECT_COUNT', source.db, table),
                success   : function(config, response) {

                    me.updateProgress(me.progressNum, me.progressTotal, 'Get total record..');
                    me.progressNum++;

                    var row = Planche.DBUtil.getAssocArray(response.fields, response.records)[0];
                    callback(null, parseInt(row.cnt, 10));
                },
                failure   : function(config, response) {

                    callback(app.generateError(config.query, response.message));
                }
            });
        }
    },

    copyTableData : function(tables, callback){

        var me = this,
            source = this.getSelectedSource(),
            options = this.getCopyOptions();


        if (options['copy-database-option-1'] === 2) {

            callback(null);
            return;
        }

        var tasks = [];
        Ext.Object.each(tables, function(table, total) {

            tasks.push(me._copyTableData(table, total));
        });

        async.series(tasks, function (err, results) {

            if(err) {

                callback(err);
                return;
            }

            callback(null);
        });
    },

    _copyTableData : function(table, total){

        var me = this;

        return function(callback){

            me.progressNum = 0;
            me.progressTotal = total;

            me._copyRecord(table, total, callback);
        };
    },

    _copyRecord: function(table, total, callback){

        var me = this,
            app = this.getApplication(),
            api = app.getAPIS(),
            options = this.getCopyOptions(),
            source = this.getSelectedSource(),
            target = this.getSelectedTarget(),
            copyPerOnce = 1;

        //If not in the jsonp it can do bulk copy
        if (options['copy-database-option-3'] === 'on') {

            copyPerOnce = 10000;
        }

        var totalPage = Math.ceil(total / copyPerOnce),
            offset = 0,
            tasks = [];
        for(var page = 0 ; page < totalPage ; page ++){

            tasks.push(
                function(callback2){

                    var query = api.getQuery('SELECT_TABLE', source.db, table, '*', 'LIMIT ' + offset + ', ' + copyPerOnce);
                    app.tunneling({
                        connection: source.connection,
                        db        : source.db,
                        query     : query,
                        success   : function(config, response) {

                            callback2(null, response);
                        },
                        failure   : function(config, response) {

                            callback2(app.generateError(config.query, response.message));
                        }
                    });
                },
                function(response, callback2){

                    me._insertBulkRecord(response, table, function(err){

                        if(err){

                            callback2(err);
                            return;
                        }

                        if(me.progressNum > me.progressTotal){

                            me.progressNum = me.progressTotal;
                        }

                        me.updateProgress(me.progressNum, me.progressTotal, 'Copy ' + table + '..');
                        me.progressNum += copyPerOnce;

                        offset += copyPerOnce;

                        callback2(null);
                    });
                }
            );
        }

        async.waterfall(tasks, function (err) {

            if(err){

                callback(err);
                return;
            }

            callback(null);
        });
    },

    _insertBulkRecord: function(response, table, callback){

        var me = this,
            app = this.getApplication(),
            api = app.getAPIS(),
            fields = [],
            target = this.getSelectedTarget();

        response.fields.map(function(field, idx) {

            fields.push("`" + field.name + "`");
        });

        if (response.records.length === 0) {

            return;
        }

        var values = [];
        response.records.map(function(row, idx) {

            var value = [];
            for (var field in row) {

                var v = row[field];
                if (v === null) {

                    value.push("NULL");
                    continue;
                }
                else if (!v) {

                    value.push("''");
                    continue;
                }

                value.push('"' + Planche.DBUtil.escapeString(v) + '"');
            }

            values.push("(" + value.join(",") + ")");
        });

        app.tunneling({
            connection: target.connection,
            db        : target.db,
            query     : api.getQuery('INSERT_TABLE_BULK', target.db, table, fields.join(','), values.join(',')),
            success   : function(config, response) {

                callback(null);
            },
            failure   : function(config, response) {

                callback(app.generateError(config.query, response.message));
            }
        });
    },

    close: function(btn) {

        btn.up('window').destroy();
    },

    getCopyOptions: function(){

        var form = Ext.getCmp('copy-database-option-form');

        return form.getValues();
    },

    finish: function(){

        var app = this.getApplication(),
            me = this,
            btnCopy = Ext.getCmp('copy-database-btn-copy');

        var progress = me.getProgressBox();

        btnCopy.setDisabled(false);
        progress.close();

        Ext.Msg.alert('info', 'Successfully completed');

        app.fireEvent('after_copy_tables');
    },

    failure: function(err){

        var app = this.getApplication(),
            me = this,
            btnCopy = Ext.getCmp('copy-database-btn-copy');

        var progress = me.getProgressBox();

        btnCopy.setDisabled(false);
        progress.close();

        app.openMessage(err);
    },

    getQueue: function() {

        return this.queue.shift();
    },

    getProgressBox: function() {

        return Ext.MessageBox.show({
            title       : 'Copy Table to Different Host',
            progressText: 'Processing...',
            width       : 300,
            progress    : true,
            closable    : false,
            hidden      : true
        });
    },

    getSelectedTarget: function() {

        var grid = Ext.getCmp('copy-database-target-grid'),
            selected = grid.getSelectionModel().getSelection();

        if (selected.length === 0) {

            return false;
        }

        var target = selected.shift(),
            db = target.raw.database,
            connection = target.raw.tab;

        return {
            db        : db,
            connection: connection
        }
    },

    getSelectedSource: function() {

        var app = this.getApplication(),
            tree = Ext.getCmp('copy-database-source-tree'),
            selected = tree.getChecked(),
            source = {},
            connection = app.getActiveConnectTab(),
            db = tree.getRootNode().get('text'),
            me = this;

        if (selected.length === 0) {

            return false;
        }

        selected.map(function(node, idx) {

            var type = node.raw.type;
            source[type] = source[type] || [];
            source[type].push(node.raw.text);
        });

        source.connection = connection;
        source.db = db;

        return source;
    },

    updateProgress : function(idx, total, title) {

        var num = parseInt(idx, 10) + 1,
            val = (num / total),
            per = Math.ceil(val * 100),
            progress = this.getProgressBox();

        progress.updateProgress(val, title + ' ' + per + '% (' + num + '/' + total + ')');
    }
});
