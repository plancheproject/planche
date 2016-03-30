Ext.define('Planche.store.GrantSchemaTree', {
    extend: 'Ext.data.TreeStore',
    root  : {
        type    : 'global',
        path    : 'global',
        text    : 'Global Privileges',
        expanded: true
    }
});