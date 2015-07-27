Ext.define('Planche.controller.layout.SchemeTree', {
    extend: 'Planche.lib.SchemaTree',
    views : [
        'layout.SchemeTree'
    ],
    stores: [
        'SchemeTree'
    ],
    init  : function() {

        var app = this.getApplication(),
            me = this;

        this.control({
            'scheme-tree': {
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

                    var task = new Ext.util.DelayedTask();
                    task.delay(100, function() {

                        var node = tree.getRootNode();

                        var tab = app.getActiveConnectTab();
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

        var tree = tab.down('scheme-tree'),
            app = this.getApplication(),
            selected = tree.getSelectionModel().getSelection();

        app.setSelectedTree(tree);

        if(selected.length == 0){

            return;
        }

        app.setSelectedNode(selected[0]);
    }
});
