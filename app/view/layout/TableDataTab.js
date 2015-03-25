Ext.define('Planche.view.layout.TableDataTab', {
    extend: 'Ext.container.Container',
    xtype : 'table-data-tab',
	layout: 'fit',
	split	: true,
	icon	: 'resources/images/icon_table.png',
	title	: 'Table Data',
	border	: false,
	frame   : false,
	flex	: 1,
    listeners : {
    	scope : this,
    	show : function(grid){

    // 		var node = this.getSelectedNode();
    // 		var tree = this.getSelectedTree();

    // 		if(!node){ return; }

	   //      if(node.data.depth == 3 && (this.getParentNode(node, 2) == 'Tables' || this.getParentNode(node, 2) == 'Views')){

				// var tab = this.getActiveTableDataTab();
				// if(tab.loadedTable == node.data.text){ return; }
	   //      	this.openTable(node);
	   //      }
    	}
    }
});