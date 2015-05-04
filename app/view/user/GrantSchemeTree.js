Ext.define('Planche.view.user.GrantSchemeTree', {
    extend       : 'Ext.tree.Panel',
    alias        : 'widget.grant-scheme-tree',
    initComponent: function () {

        this.store = Ext.create('Planche.store.GrantSchemeTree');

        this.callParent(arguments);
    }
});