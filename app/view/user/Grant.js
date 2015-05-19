Ext.define('Planche.view.user.Grant', {
    extend       : 'Planche.lib.Window',
    alias        : 'widget.grant',
    stateful     : true,
    title        : 'User Manager',
    layout       : 'border',
    bodyStyle    : "background-color:#FFFFFF",
    width        : 900,
    height       : 500,
    overflowY    : 'auto',
    autoScroll   : true,
    modal        : true,
    plain        : true,
    fixed        : true,
    shadow       : false,
    autoShow     : true,
    constrain    : true,
    config       : {
        application: null
    },
    tbar         : [
        {
            xtype: 'button',
            id   : 'grant-add-user',
            text : 'Add User'
        }
    ],
    buttons      : [{
        id      : 'grant-save-changes',
        text    : 'Save Changes'
    }, {
        id      : 'grant-cancel-changes',
        text    : 'Cancel Changes'
    }, {
        id  : 'grant-close',
        text: 'Close'
    }],
    initComponent: function() {

        this.items = [{
            xtype      : 'grant-user-list',
            id         : 'grant-user-list',
            region     : 'west',
            flex       : 1,
            height     : '100%',
            split      : true,
            disabled   : false,
            application: this.getApplication()
        }, {
            xtype   : 'grant-scheme-tree',
            id      : 'grant-scheme-tree',
            region  : 'center',
            width   : 200,
            height  : '100%',
            disabled: true
        }, {
            xtype   : 'grant-priv-list',
            id      : 'grant-priv-list',
            region  : 'east',
            height  : '100%',
            flex    : 1,
            split   : true,
            disabled: true
        }];

        this.callParent(arguments);
    }
});