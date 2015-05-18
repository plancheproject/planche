Ext.define('Planche.store.GrantSchemeTree', {
    extend: 'Ext.data.TreeStore',
    root  : {
        type    : 'global',
        path    : 'global',
        text    : 'Global Privileges',
        expanded: true
    }
});