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
            this.initFooter(),
            this.initContextMenu()
        ];

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
        var menus = ['Connection', 'Query', 'Edit', 'Database', 'Table', 'Export', 'Tools', 'Help'];

        return {
            xtype   : 'toolbar',
            id      : 'top-menu',
            margin  : '0px 0px 2px 0px',
            defaults: {
                xtype: 'splitbutton',
                split: false
            },
            items   : (function() {

                var tmp = [];
                Ext.Array.each(menus, function(name, idx) {

                    tmp.push({text: name, menu: Ext.create('Ext.menu.Menu')});
                });

                return tmp;
            })(),
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
            id      : 'schema-context-menu',
            defaults: {
                scope: this
            },
            items   : []
        };
    },

    /**
     * initialize footer
     *
     * @method initFooter
     */
    initFooter: function() {

        return {
            xtype   : 'container',
            layout  : 'hbox',
            id      : 'planche-footer',
            defaults: {
                scope: this
            },
            items   : [{
                xtype : 'progressbar',
                id    : 'footer-task-progressbar',
                width : 200,
                height: 20
            }, {
                xtype  : 'component',
                width : '100%',
                border: 1,
                text   : 'Loading tasks',
                margin : '0px 0px 0px 5px',
                padding: '3px 0px 0px 0px',
                html   : '<div id="footer-task-message">Task status</div>',
                style  : {
                    color: '#629632'
                }
            }]
        };
    }
});
