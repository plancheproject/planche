Ext.define('Planche.controller.layout.SchemaTree', {
    extend: 'Planche.lib.SchemaTree',
    views : [
        'layout.SchemaTree'
    ],
    stores: [
        'SchemaTree'
    ],
    init  : function() {

        var app = this.getApplication(),
            me = this;

        this.control({
            'schema-tree': {
                select          : function(tree, node, index, eOpts) {

                    app.setSelectedNode(node);
                    app.setSelectedTree(node.getOwnerTree());

                    this.selectNode(tree, node, index, eOpts);
                },
                beforeitemexpand: this.expandTree,
                show            : this.showTree,
                reloadTree      : this.reloadTree,
                expandTree      : this.expandTree,
                boxready        : function(tree) {

                    var node = tree.getRootNode(),
                        tab = tree.up('connect-tab'),
                        task = new Ext.util.DelayedTask();

                    task.delay(100, function() {

                        node.set('text', tab.getUser() + '@' + tab.getHost());

                        app.setSelectedTree(tree);

                        tree.getSelectionModel().select(node);

                        me.loadTree(node);

                    }, this);
                }
            },
            'connect-tab': {
                show  : this.showTree,
                select: this.showTree
            }
        });
    },

    showTree: function(tab) {

        var tree = tab.down('schema-tree'),
            app = this.getApplication(),
            selected = tree.getSelectionModel().getSelection();

        app.setSelectedTree(tree);

        if(selected.length == 0){

            return;
        }

        app.setSelectedNode(selected[0]);
    }
});
