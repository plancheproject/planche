Ext.define('Planche.lib.SchemaTree', {
    extend: 'Ext.app.Controller',
    config: {
        databasesChildren: [{
            type: 'tables',
            text: 'Tables',
            leaf: false
        }, {
            type: 'views',
            text: 'Views',
            leaf: false
        }, {
            type: 'procedures',
            text: 'Procedures',
            leaf: false
        }, {
            type: 'functions',
            text: 'Functions',
            leaf: false
        }, {
            type: 'triggers',
            text: 'Triggers',
            leaf: false
        }, {
            type: 'events',
            text: 'Events',
            leaf: false
        }],
        tablesChildren   : [{
            type: 'columns',
            text: 'Columns',
            leaf: false
        }, {
            type: 'indexes',
            text: 'Indexes',
            leaf: false
        }],
        rootType         : 'root',
        tables           : {}
    },

    constructor: function(config) {

        this.callParent(arguments);
    },

    selectNode: function(tree, node, index, eOpts) {

        var app = this.getApplication();

        if (node.raw.type == 'table' || node.raw.type == 'view') {

            if (app.getActiveTableDataTab().isVisible()) {

                var db = app.getSelectedDatabase(),
                    table = app.getSelectedNode();

                if (app.openMode == 'select') {

                    app.openTable(db, table);
                }
                else {

                    app.countTable(db, table);
                }
            }
        }
    },

    expandTree: function(node, nodeConfig) {

        if (node.childNodes.length > 0) { return; }
        this.loadTree(node, nodeConfig);
    },

    loadTree: function(node, nodeConfig) {

        //var loadFunc = this['load' + (node.raw.type == this.getRootType() ? 'Databases' : node.data.text.replace(/\s/gi, ''))];
        var loadFunc = this['load' + (node.raw.type == this.getRootType() ? 'Databases' : node.raw.type.substring(0, 1).toUpperCase() + node.raw.type.substring(1))];

        if (loadFunc) {

            node.removeAll();
            Ext.Function.bind(loadFunc, this)(node, nodeConfig);
        }
    },

    reloadTree: function(node, nodeConfig) {

        this.loadTree(node, nodeConfig);
    },

    loadDatabases: function(node, nodeConfig) {

        var app = this.application,
            me = this,
            tree = node.getOwnerTree(),
            tab = tree.up('connect-tab');

        nodeConfig = nodeConfig || {};

        tree.setLoading(true);

        app.tunneling({
            connection: tab,
            query     : app.getAPIS().getQuery('SHOW_DATABASE'),
            success   : function(config, response) {

                var children = [];
                Ext.Array.each(response.records, function(row, idx) {

                    children.push(Ext.apply({
                        type    : 'database',
                        path    : ['database', row[0]].join("`"),
                        text    : row[0],
                        icon    : 'resources/images/icon_database.png',
                        leaf    : false,
                        children: (function(){

                            var subNode = Ext.clone(me.getDatabasesChildren());
                            Ext.Array.each(subNode, function(child){

                                child.path = [child.type, row[0], child.text].join("`");
                            });

                            return subNode;
                        })()
                    }, nodeConfig));
                });

                if (children.length === 0) {

                    tree.setLoading(false);
                    return;
                }

                node.appendChild(children);
                tree.setLoading(false);
            },
            failure   : function(config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadTables: function(node, nodeConfig) {

        var app = this.application,
            me = this,
            db = app.getParentNode(node, 'database'),
            tree = node.getOwnerTree();

        nodeConfig = nodeConfig || {};

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_ALL_TABLE_STATUS', db),
            success: function(config, response) {

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function(row, idx) {

                    if (row[1] == 'NULL') { return; }

                    children.push(Ext.apply({
                        type    : 'table',
                        path    : ['table', db, row[0]].join("`"),
                        text    : row[0],
                        icon    : 'resources/images/icon_table.png',
                        leaf    : false,
                        children: (function(){

                            var subNode = Ext.clone(me.getTablesChildren());
                            Ext.Array.each(subNode, function(child){

                                child.path = [child.type, db, row[0], child.text].join("`");
                            });

                            return subNode;
                        })()
                    }, nodeConfig));
                });

                if (children.length === 0) {

                    tree.setLoading(false);
                    return;
                }

                node.appendChild(children);

                tree.fireEvent('iteminsert', tree, node);

                tree.setLoading(false);
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadViews: function(node, nodeConfig) {

        var app = this.application,
            db = app.getParentNode(node, 'database'),
            tree = node.getOwnerTree();

        nodeConfig = nodeConfig || {};

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_VIEWS', db),
            success: function(config, response) {

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function(row, idx) {

                    children.push(Ext.apply({
                        type: 'view',
                        path: ['view', db, row[0]].join("`"),
                        text: row[0],
                        leaf: true
                    }, nodeConfig));
                });

                if (children.length === 0) {

                    tree.setLoading(false);
                    return;
                }

                node.appendChild(children);
                tree.setLoading(false);
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadProcedures: function(node, nodeConfig) {

        var app = this.application,
            db = app.getParentNode(node, 'database'),
            tree = node.getOwnerTree();

        nodeConfig = nodeConfig || {};

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_PROCEDURES', db),
            success: function(config, response) {

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function(row, idx) {

                    children.push(Ext.apply({
                        type: 'procedure',
                        path: ['procedure', db, row[1]].join("`"),
                        text: row[1],
                        leaf: true
                    }, nodeConfig));
                });

                if (children.length === 0) {

                    tree.setLoading(false);
                    return;

                }

                node.appendChild(children);
                tree.setLoading(false);
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadFunctions: function(node, nodeConfig) {

        var app = this.application,
            db = app.getParentNode(node, 'database'),
            tree = node.getOwnerTree();

        nodeConfig = nodeConfig || {};

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_FUNCTIONS', db),
            success: function(config, response) {

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function(row, idx) {

                    children.push(Ext.apply({
                        type: 'function',
                        path: ['function', db, row[1]].join("`"),
                        text: row[1],
                        leaf: true
                    }, nodeConfig));
                });

                if (children.length === 0) {

                    tree.setLoading(false);
                    return;
                }

                node.appendChild(children);
                tree.setLoading(false);
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadTriggers: function(node, nodeConfig) {

        var app = this.application,
            db = app.getParentNode(node, 'database'),
            tree = node.getOwnerTree();

        nodeConfig = nodeConfig || {};

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_TRIGGERS', db),
            success: function(config, response) {

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function(row, idx) {

                    children.push(Ext.apply({
                        type: 'trigger',
                        path: ['trigger', db, row[0]].join("`"),
                        text: row[0],
                        leaf: true
                    }, nodeConfig));
                });

                if (children.length === 0) {

                    tree.setLoading(false);
                    return;
                }
                node.appendChild(children);
                tree.setLoading(false);
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadEvents: function(node, nodeConfig) {

        var app = this.application,
            db = app.getParentNode(node, 'database'),
            tree = node.getOwnerTree();

        nodeConfig = nodeConfig || {};

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_EVENTS', db),
            success: function(config, response) {

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function(row, idx) {

                    children.push(Ext.apply({
                        type: 'event',
                        path: ['event', db, row[0]].join("`"),
                        text: row[0],
                        leaf: true
                    }, nodeConfig));
                });

                if (children.length === 0) {

                    tree.setLoading(false);
                    return;
                }
                node.appendChild(children);
                tree.setLoading(false);
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadColumns: function(node, nodeConfig) {

        var app = this.application,
            db = app.getParentNode(node),
            tb = app.getParentNode(node, 'table'),
            tree = node.getOwnerTree();

        nodeConfig = nodeConfig || {};

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_FULL_FIELDS', db, tb),
            success: function(config, response) {

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function(row, idx) {

                    children.push(Ext.apply({
                        type: 'column',
                        path: ['column', db, tb, row[0]].join("`"),
                        name: row[0],
                        text: row[0] + ' ' + row[1] + (row[8] ? ' [ ' + row[8] + ' ] ' : ''),
                        icon: 'resources/images/icon_' + (row[4] == 'PRI' ? 'primary' : 'column') + '.png',
                        leaf: true,
                        qtip: row[8]
                    }, nodeConfig));
                });

                if (children.length === 0) {

                    tree.setLoading(false);
                    return;
                }
                node.appendChild(children);
                tree.setLoading(false);
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadIndexes: function(node, nodeConfig) {

        var app = this.application,
            db = app.getParentNode(node),
            tb = app.getParentNode(node, 'table'),
            tree = node.getOwnerTree();

        nodeConfig = nodeConfig || {};

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_INDEXES', db, tb),
            success: function(config, response) {

                var children = [];
                node.removeAll();
                var groups = {};
                Ext.Array.each(response.records, function(row, idx) {

                    groups[row[2]] = groups[row[2]] || [];
                    groups[row[2]].push('\'' + row[4] + '\'');
                });

                Ext.Object.each(groups, function(name, columns) {

                    children.push(Ext.apply({
                        type: 'index',
                        path: ['index', db, tb, name].join("`"),
                        text: name + ' (' + columns.join(',') + ')',
                        icon: 'resources/images/icon_table.png',
                        leaf: true
                    }, nodeConfig));
                });

                if (children.length === 0) {

                    tree.setLoading(false);
                    return;
                }

                node.appendChild(children);
                tree.setLoading(false);
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    }
});