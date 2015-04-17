Ext.define('Planche.lib.Window', {
    extend : 'Ext.window.Window',
    config : {
        buttons : []
    },
    initComponent : function () {

        this.callParent(arguments);

        if(typeof this.buttons == 'undefined' || this.buttons == null) {

            this.buttons = [];
        }

        if(this.closable) {

            this.buttons.push({
                text: '닫기',
                handler: function (button, event) {
                                                
                    var win = button.up("window");
                    win.destroy();
                }
            });
        }
    },
    stateful: true,
    layout : 'fit',
    bodyStyle:"background-color:#FFFFFF",
    tools: [{
        type:'maximize',
        handler: function (event, toolEl, owner, tool) {

            owner.up("window").toggleMaximize();
        }
    },{
        hidden : true,
        type:'restore',
        handler: function (event, toolEl, owner, tool) {

            var win = owner.up("window");

            var state = win.getState();

            win.setPosition(state.pos[0], state.pos[1]);

            win.toggleMaximize();
        }
    }],
    width : 900,
    height: 800,
    overflowY: 'auto',
    autoScroll : true,
    plain: true,
    fixed : true,
    shadow : false,
    autoShow : true,
    constrain : true,
    modal : true
});