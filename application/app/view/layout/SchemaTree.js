Ext.define('Planche.view.layout.SchemaTree', {
    extend       : 'Ext.tree.Panel',
    alias        : 'widget.schema-tree',
    config : {
        database : null
    },
    initComponent: function() {

        this.store = Ext.create('Planche.store.SchemaTree');
        this.callParent(arguments);
    },
    width        : 200,
    height       : '100%',
    region       : 'west',
    split        : true
});