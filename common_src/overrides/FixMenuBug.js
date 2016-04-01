// fix hide submenu (in chrome 43)
Ext.define("Planche.overrides.FixMenuBug", {
    override: "Ext.menu.Menu",
    onMouseLeave: function(e) {
        var me = this;


        // BEGIN FIX
        var visibleSubmenu = false;
        me.items.each(function(item) {
            if(item.menu && item.menu.isVisible()) {
                visibleSubmenu = true;
            }
        })
        if(visibleSubmenu) {
            //console.log('apply fix hide submenu');
            return;
        }
        // END FIX


        me.deactivateActiveItem();


        if (me.disabled) {
            return;
        }


        me.fireEvent('mouseleave', me, e);
    }
});