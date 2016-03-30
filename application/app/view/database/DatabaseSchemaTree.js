Ext.define('Planche.view.database.DatabaseSchemaTree', {
    extend       : 'Ext.tree.Panel',
    alias        : 'widget.database-schema-tree',
    config       : {
        database: null
    },
    rootVisible  : true,
    width        : 200,
    height       : '100%',
    initComponent: function() {

        this.store = Ext.create('Planche.store.DatabaseSchemaTree');
        this.callParent(arguments);
    }
});