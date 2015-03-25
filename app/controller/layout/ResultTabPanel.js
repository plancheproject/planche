Ext.define('Planche.controller.layout.ResultTabPanel', {
    extend: 'Ext.app.Controller',
    controllers : [
        'layout.MessageTab',
        'layout.TableDataTab',
        'layout.InfoTab',
        'layout.HistoryTab'
    ],
    views : [
        'layout.MessageTab',
        'layout.TableDataTab',
        'layout.InfoTab',
        'layout.HistoryTab'
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