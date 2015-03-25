Ext.define('Planche.view.layout.SchemeTree', {
	extend	: 'Ext.tree.Panel',
	alias	: 'widget.scheme-tree',
    initComponent : function(){

    	this.store = Ext.create('Planche.store.SchemeTree');
    	
    	this.callParent(arguments);
    },
    width   : 200,
    height  : '100%',
    region  : 'west',
    split   : true
});