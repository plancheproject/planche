Ext.define('Planche.view.user.GrantSchemaTree', {
    extend       : 'Ext.tree.Panel',
    alias        : 'widget.grant-schema-tree',
    initComponent: function () {

        this.store = Ext.create('Planche.store.GrantSchemaTree');

        this.callParent(arguments);
    }
});