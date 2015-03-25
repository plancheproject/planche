Ext.define('Planche.controller.layout.QueryTabPanel', {
    extend: 'Ext.app.Controller',
    controllers : [
        'layout.QueryTab'
    ],
    views : [
        'layout.QueryTab'
    ],
    init : function(){

        // this.control({
        //     'scheme-tree' : {
        //         beforeitemexpand : this.expandTree,
        //         select : function(view){

        //             var treeview = view.views[0];                       
        //             var tree = treeview.up("treepanel");
        //             this.getApplication().setSelectedTree(tree);
        //         },
        //         show : function(tree){

        //             this.getApplication().setSelectedTree(tree);                     
        //         },
        //         boxready : function(tree){

        //             var sel = this.getApplication().getSelectedTree();
        //             if(!sel) Planche.selectedTree = tree;
        //         }
        //     }
        // });
    }
});