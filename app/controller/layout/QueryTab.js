Ext.define('Planche.controller.layout.QueryTab', {
    extend: 'Ext.app.Controller',
    controllers : [
        'layout.QueryEditor',
        'layout.ResultTabPanel'
    ],
    views : [
        'layout.QueryEditor',
        'layout.ResultTabPanel'
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