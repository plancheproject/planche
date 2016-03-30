Ext.define('Planche.controller.database.CopyDatabaseWindow', {
    extend: 'Planche.lib.SchemaTree',
    views : [
        'database.CopyDatabaseWindow',
        'database.DatabaseSchemaTree'
    ],
    config: {
        tablesChildren: []
    },
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

                    if (connectTabs == 0) {

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
        this.selectedSource = [];
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

        this.addTableCopyQueue(true);

        Ext.Object.each(source['view'] || [], function(idx, src) {

            me.addDropObjectQueue('view', target.db, src);

            me.addQueue(
                'view-structure',
                source.connection,
                source.db,
                api.getQuery('SHOW_CREATE_VIEW', source.db, src),
                me.addCopyQueue,
                ['view']
            );
        });

        Ext.Object.each(source['procedure'] || [], function(idx, src) {

            me.addDropObjectQueue('procedure', target.db, src);

            me.addQueue(
                'procedure-structure',
                source.connection,
                source.db,
                api.getQuery('SHOW_CREATE_PROCEDURE', source.db, src),
                me.addCopyQueue,
                ['procedure']
            );
        });

        Ext.Object.each(source['function'] || [], function(idx, src) {

            me.addDropObjectQueue('function', target.db, src);

            me.addQueue(
                'function-structure',
                source.connection,
                source.db,
                api.getQuery('SHOW_CREATE_FUNCTION', source.db, src),
                me.addCopyQueue,
                ['function']
            );
        });

        Ext.Object.each(source['trigger'] || [], function(idx, src) {

            me.addDropObjectQueue('trigger', target.db, src);

            me.addQueue(
                'trigger-structure',
                source.connection,
                source.db,
                api.getQuery('SHOW_CREATE_TRIGGER', source.db, src),
                me.addTriggerCopyQueue
            );
        });

        Ext.Object.each(source['event'] || [], function(idx, src) {

            me.addDropObjectQueue('event', target.db, src);

            me.addQueue(
                'event-structure',
                source.connection,
                source.db,
                api.getQuery('SHOW_CREATE_EVENT', source.db, src),
                me.addCopyQueue,
                ['event']
            );
        });

        this.runQueue();
    },

    close: function(btn) {

        btn.up('window').destroy();
    },

    addTriggerCopyQueue: function(config, response) {

        var app = this.getApplication(),
            row = Planche.DBUtil.getAssocArray(response.fields, response.records)[0],
            query = row['SQL Original Statement'],
            target = this.getSelectedTarget();

        this.addQueue(
            'trigger-copy',
            target.connection,
            target.db,
            query
        );
    },

    addCopyQueue: function(config, response, type) {

        //queue.type을 작업해줘야합니다.
        var app = this.getApplication(),
            row = Planche.DBUtil.getAssocArray(response.fields, response.records)[0],
            query = row['Create ' + type[0].toUpperCase() + type.slice(1)],
            target = this.getSelectedTarget(),
            form = Ext.getCmp('copy-database-option-form'),
            options = form.getValues();

        this.addQueue(
            (type + '-copy'),
            target.connection,
            target.db,
            query
        );

        if (options['copy-database-option-1'] !== 1) {

            this.addTableCopyQueue();
        }
    },

    addTableCopyQueue: function(init) {

        var app = this.getApplication(),
            api = app.getAPIS(),
            me = this,
            target = this.getSelectedTarget(),
            form = Ext.getCmp('copy-database-option-form'),
            options = form.getValues();

        if (init) {

            this.selectedSource = this.getSelectedSource();

            if (options['copy-database-option-3'] === 'on') {

                this.copyPerOnce = 10000;
            }
            else {

                this.copyPerOnce = 1;
            }
        }

        this.selectedSource.table = this.selectedSource.table || [];

        if (this.selectedSource.table.length == 0) {

            return;
        }

        var src = this.selectedSource.table.shift();

        if (!src) {

            return;
        }

        me.addQueue(
            'table-structure',
            this.selectedSource.connection,
            this.selectedSource.db,
            api.getQuery('SHOW_CREATE_TABLE', this.selectedSource.db, src),
            me.addCopyQueue,
            ['table']
        );

        if (options['copy-database-option-2'] === 'on') {

            me.addDropObjectQueue('table', target.db, src);
        }

        if (options['copy-database-option-1'] === 1) {

            me.addQueue(
                'table-count',
                this.selectedSource.connection,
                this.selectedSource.db,
                api.getQuery('SELECT_COUNT', this.selectedSource.db, src),
                me.addDataSelectQueue,
                [this.selectedSource.connection, this.selectedSource.db, src, true]
            );
        }
    },

    addDropObjectQueue: function(type, db, obj) {

        var app = this.getApplication(),
            api = app.getAPIS(),
            target = this.getSelectedTarget();

        this.addQueue(
            'object-drop',
            target.connection,
            target.db,
            api.getQuery('DROP_' + type.toUpperCase(), db, obj, 'IF EXISTS')
        );
    },

    addDataSelectQueue: function(config, response, connection, db, table, init) {

        //queue.type을 작업해줘야합니다.
        var app = this.getApplication(),
            api = app.getAPIS();

        if (init) {

            this.tableInfo[table] = this.tableInfo[table] || {};
            var info = this.tableInfo[table],
                row = Planche.DBUtil.getAssocArray(response.fields, response.records)[0];

            info.cnt = parseInt(row.cnt, 10);
            info.offset = 0;
        }
        else {

            var info = this.tableInfo[table];
            info.offset += this.copyPerOnce;
        }

        if (info.cnt == 0) {

            this.addTableCopyQueue();
            return;
        }

        if ((info.cnt - info.offset) < 1) {

            this.addTableCopyQueue();
            return;
        }

        if (info.offset >= info.cnt) {

            info.offset = info.cnt;
        }

        var query = api.getQuery('SELECT_TABLE', db, table, '*', 'LIMIT ' + info.offset + ', ' + this.copyPerOnce);

        this.addQueue(
            'data-copy',
            connection,
            db,
            query,
            this.addDataInsertQueue,
            [connection, db, table]
        );
    },

    addDataInsertQueue: function(config, response, connection, db, table) {

        var app = this.getApplication(),
            api = app.getAPIS(),
            me = this,
            target = this.getSelectedTarget();

        var fields = [];
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

                if (row[field] === null) {

                    value.push("NULL");
                    continue;
                }
                else if (!row[field]) {

                    value.push("''");
                    continue;
                }

                value.push("'" + Ext.String.escape(row[field]) + "'");
            }

            values.push("(" + value.join(",") + ")");
        });

        var query = api.getQuery('INSERT_TABLE_BULK', target.db, table, fields.join(','), values.join(','));

        me.addQueue(
            'data-insert',
            target.connection,
            target.db,
            query,
            me.addDataSelectQueue,
            [connection, db, table, false]
        );
    },

    addQueue: function(type, connection, db, query, callback, params) {

        callback = callback || function() {
        };
        params = params || [];

        this.queue.push({
            type      : type,
            connection: connection,
            db        : db,
            query     : query,
            callback  : callback,
            params    : params
        });
    },

    resetQueue: function() {

        this.queue = [];
    },

    getQueue: function() {

        return this.queue.shift();
    },

    runQueue: function() {

        var app = this.getApplication(),
            me = this,
            btnCopy = Ext.getCmp('copy-database-btn-copy');

        var progress = this.getProgressBox(),
            page = {},
            total = {},
            total_page = {},
            copy_per_page = this.copyPerOnce,
            table = null,
            execute;

        progress.updateProgress(0, 'Processing...');
        (execute = function() {

            var queue = me.getQueue();

            if (queue) {

                app.tunneling({
                    connection: queue.connection,
                    db        : queue.db,
                    query     : queue.query,
                    type      : 'copy',
                    success   : function(config, response) {

                        if (queue.type == 'table-count') {

                            table = queue.params[2];
                            total[table] = parseInt(response.records[0][0], 10);
                            total_page[table] = Math.ceil(total[table] / copy_per_page);
                            page[table] = 1;
                        }

                        if (queue.type == 'data-insert') {

                            table = queue.params[2];
                            var num = Math.ceil((page[table] / total_page[table]) * 100),
                                val = num / 100,
                                curCnt = page[table] * copy_per_page;

                            if (curCnt > total[table]) {

                                curCnt = total[table];
                            }

                            progress.setTitle('Copy Table to Different Host - ' + queue.params[1] + '.' + table);
                            progress.updateProgress(val, 'Copies ' + num + '% (' + curCnt + '/' + total[table] + ')');

                            page[table]++;
                        }

                        queue.callback.apply(me, [config, response].concat(queue.params));
                        execute();
                    },
                    failure   : function(config, response) {

                        btnCopy.setDisabled(false);
                        me.messages.push(this.generateError(queue.query, response.message));

                        progress.updateProgress(1, 'Failed! See the error message');
                        setTimeout(function() {

                            progress.close();
                        }, 2000);

                        me.openMessage();
                    }
                });
            }
            else {

                btnCopy.setDisabled(false);

                progress.updateProgress(1, 'Successfully completed');

                app.fireEvent('after_copy_tables');

                setTimeout(function() {

                    progress.close();
                }, 2000);

                if (me.openMessage()) {

                    return;
                }
            }

        })();

    },

    getProgressBox: function() {

        return Ext.MessageBox.show({
            title       : 'Copy Table to Different Host',
            progressText: 'Copies...',
            width       : 300,
            progress    : true,
            closable    : false,
            hidden      : true
        });
    },

    getSelectedTarget: function() {

        var grid = Ext.getCmp('copy-database-target-grid'),
            selected = grid.getSelectionModel().getSelection();

        if (selected.length == 0) {

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

        if (selected.length == 0) {

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

    openMessage: function(message) {

        message = message || '';

        var app = this.getApplication();

        app.openMessage(message);

        if (message) {

            return true;
        }

        if (this.messages.length > 0) {

            app.openMessage(this.messages);
            return true;
        }
        else {

            return false;
        }
    }
});