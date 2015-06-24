Ext.define('Planche.view.Main', {
    extend : 'Ext.container.Container',
    xtype  : 'app-main',
    style  : {"background": "#E0E0E0"},
    padding: 5,
    layout : {
        type: 'vbox'
    },

    /**
     * Planche Main View
     *
     * @class Planche.view.Main
     * @constructor
     */
    initComponent: function() {

        this.items = [
            this.initTopMenu(),
            this.initToolBar(),
            this.initConnectTabPanel(),
            this.initContextMenu()
        ]

        this.callParent(arguments);
    },

    /**
     * initialize top menu
     *
     * @method initTopMenu
     */
    initTopMenu: function() {

        //'Other'
        //'Favorites',
        var menus = ['Connection', 'Edit', 'Database', 'Table', 'Tools'];

        return {
            xtype   : 'toolbar',
            id      : 'top-menu',
            margin  : '0px 0px 2px 0px',
            defaults: {
                xtype: 'splitbutton',
                split: false
            },
            items   : function() {

                var tmp = [];
                Ext.Array.each(menus, function(name, idx) {

                    tmp.push({text: name, menu: Ext.create('Ext.menu.Menu')});
                });

                return tmp;
            }(),
            height  : 30,
            width   : '100%'
        };
    },

    /**
     * initialize tool-bar
     *
     * @method initToolBar
     */
    initToolBar: function() {

        return {
            xtype  : 'planche-toolbar',
            id     : 'planche-toolbar',
            padding: 3,
            margin : '0px 0px 1px 0px'
        };
    },

    /**
     * initialize connnect tab panel
     *
     * @method initConnectTabPanel
     */
    initConnectTabPanel: function() {

        //메인탭에 커넥션별 탭을 구성한다.
        return {
            id      : 'connect-tab-panel',
            xtype   : 'tabpanel',
            flex    : 1,
            width   : '100%',
            height  : '100%',
            border  : false,
            margin  : '0px 0px 5px 0px',
            stateful: true
        };
    },

    /**
     * initialize context menu
     *
     * @method initContextMenu
     */
    initContextMenu: function() {

        return {
            xtype   : 'menu',
            id      : 'scheme-context-menu',
            margin  : '0 0 10 0',
            defaults: {
                scope: this
            },
            items   : []
        };
    }
});