Ext.define('Planche.controller.layout.SchemeTree', {
    extend: 'Ext.app.Controller',
    views : [
        'layout.SchemeTree'
    ],
    stores: [
        'SchemeTree'
    ],
    init  : function () {

        var app = this.application;

        this.control({
            'scheme-tree': {
                beforeitemexpand: this.expandTree,
                show            : function (tree) {

                    app.setSelectedTree(tree);
                },
                reloadTree      : function (node) {

                    this.reloadTree(node);
                },
                expandTree      : function (node) {

                    this.expandTree(node);
                },
                boxready        : function (tree) {

                    var task = new Ext.util.DelayedTask();
                    task.delay(100, function () {

                        app.setSelectedTree(tree);

                        var node = tree.getRootNode();

                        tree.getSelectionModel().select(node);

                        this.loadTree(node);

                    }, this);
                }
            }
        });
    },

    expandTree: function (node) {

        if (node.childNodes.length > 0) { return; }
        this.loadTree(node);
    },

    loadTree: function (node) {


        var loadFunc = this['load' + (node.isRoot() ? 'Databases' : node.data.text.replace(/\s/gi, ''))];

        if (loadFunc) {

            node.removeAll();
            Ext.Function.bind(loadFunc, this)(node);
        }
    },

    reloadTree: function (node) {

        this.loadTree(node);
    },

    loadDatabases: function (node) {

        var app = this.application,
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            query  : app.getAPIS().getQuery('SHOW_DATABASE'),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        text    : row[0],
                        icon    : 'resources/images/icon_database.png',
                        leaf    : false,
                        children: [{
                            text: 'Tables',
                            leaf: false
                        }, {
                            text: 'Views',
                            leaf: false
                        }, {
                            text: 'Procedures',
                            leaf: false
                        }, {
                            text: 'Functions',
                            leaf: false
                        }, {
                            text: 'Triggers',
                            leaf: false
                        }, {
                            text: 'Events',
                            leaf: false
                        }]
                    });
                });

                if (children.length == 0) { return; }

                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadTables: function (node) {

        var app = this.application,
            db = node.parentNode.data.text,
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_ALL_TABLE_STATUS', db),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    if (row[1] == 'NULL') { return; }

                    children.push({
                        text    : row[0],
                        icon    : 'resources/images/icon_table.png',
                        leaf    : false,
                        children: [{
                            text: 'Columns',
                            leaf: false
                        }, {
                            text: 'Indexes',
                            leaf: false
                        }]
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadViews: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_VIEWS', db),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        text: row[0],
                        leaf: true
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);                
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadProcedures: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_PROCEDURES', db),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        text: row[1],
                        leaf: true
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadFunctions: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_FUNCTIONS', db),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        text: row[1],
                        leaf: true
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadTriggers: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_TRIGGERS', db),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        text: row[0] + ' - ' + row[1],
                        leaf: true
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadEvents: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_EVENTS', db),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        text: row[0],
                        leaf: true
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadColumns: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tb = node.parentNode.data.text,
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_FULL_FIELDS', db, tb),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                Ext.Array.each(response.records, function (row, idx) {

                    children.push({
                        text: row[0] + ' ' + row[1],
                        icon: 'resources/images/icon_' + (row[4] == 'PRI' ? 'primary' : 'column') + '.png',
                        leaf: true,
                        qtip: row[8]
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    },

    loadIndexes: function (node) {

        var app = this.application,
            db = app.getParentNode(node),
            tb = node.parentNode.data.text,
            tree = app.getSelectedTree();

        tree.setLoading(true);

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('SHOW_INDEXES', db, tb),
            node   : node,
            success: function (config, response) {

                tree.setLoading(false);

                var children = [];
                node.removeAll();
                var groups = {};
                Ext.Array.each(response.records, function (row, idx) {

                    groups[row[2]] = groups[row[2]] || [];
                    groups[row[2]].push('\'' + row[4] + '\'');
                });

                Ext.Object.each(groups, function (name, columns) {

                    children.push({
                        text: name + ' (' + columns.join(',') + ')',
                        icon: 'resources/images/icon_table.png',
                        leaf: true
                    });
                });

                if (children.length == 0) { return; }
                node.appendChild(children);
            },
            failure: function (config, response) {

                Ext.Msg.alert('Error', response.message);
                tree.setLoading(false);
            }
        });
    }
});

// 과거 사용하던 코드 그 쓰임새가 기억이 나질 않아 일단 주석을 해둔다. 다시 찾아보아야한다.
//   var tree = this.getSelectedTree(),
//    root = tree.getRootNode(),
//    dbNode = null, chNode = null, category = null;

//    Ext.Array.each(result.refresh_queue, function (queue, idx) {

//        if(queue.db) {

//            dbNode = root.findChild('text', queue.db);
//        }
//        else {

//            dbNode = this.getParentNode(this.getSelectedNode(), 1, true);
//        }

//        if(!dbNode) { return; }

//        tree.selModel.select(dbNode);

//        category = queue.category.charAt(0).toUpperCase();
// category = category + queue.category.toLowerCase().substr(1) + 's';
// chNode = dbNode.findChild('text', category);

// if(queue.mode == 'CREATE') {

//  chNode.appendChild([{
//               text : queue.name,
//               leaf : true
//           }]);
// }
// else if(queue.mode == 'DROP') {

//  chNode = chNode.findChild('text', queue.name);
//  chNode.remove();
// }
// else if(queue.mode == 'ALTER') {

// }

//    }, this);

