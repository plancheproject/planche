Ext.define('Planche.view.layout.Menu', {
    extend  : 'Ext.toolbar.Toolbar',
    xtype   : 'planche-menu',
    defaults: {
        xtype: 'splitbutton',
        split: false
    },
    items   : (function() {

        var menus = ['Connection'];

        if(Planche.platform == 'planche-wordpress' || Planche.platform == 'planche-desktop') {

            // menus.push('Bookmark')
        }

        menus.push(
            'Query', 'Edit', 'Database', 'Table', 'Export', 'Tools', 'Help'
        );

        var tmp = [];
        Ext.Array.each(menus, function(name, idx) {

            tmp.push({text: name, menu: Ext.create('Ext.menu.Menu')});
        });

        return tmp;
    })()
});
