Ext.define('Planche.store.SchemaTree', {
    extend: 'Ext.data.TreeStore',
    root: {
        type : 'root',
        text : 'root@',
        expanded: true
    },
    initComponent : function(){

        this.callParent(arguments);
    }
});