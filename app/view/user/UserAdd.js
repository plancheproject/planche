Ext.define('Planche.view.user.UserAdd', {
    extend       : 'Planche.lib.Window',
    alias        : 'widget.user-add',
    stateful     : true,
    title        : 'User Add',
    layout       : 'vbox',
    bodyStyle    : "background-color:#FFFFFF",
    width        : 500,
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
        user: '',
        host: ''
    },
    items        : [{
        xtype   : 'fieldset',
        title   : 'User Information',
        layout  : 'anchor',
        defaults: {
            xtype : "textfield",
            anchor: '100%'
        },
        flex    : 1,
        width   : '100%',
        items   : [{
            id        : 'user-add-user-name',
            fieldLabel: 'Username',
            value     : ''
        }, {
            id        : 'user-add-host',
            fieldLabel: 'Host',
            value     : ''
        }, {
            id        : 'user-add-password',
            fieldLabel: 'Password',
            inputType : 'password',
            value     : ''
        }, {
            id        : 'user-add-retype-password',
            fieldLabel: 'ReType Password',
            inputType : 'password',
            value     : ''
        }]
    }, {
        xtype   : 'fieldset',
        title   : 'Operation Restrictions',
        layout  : 'anchor',
        defaults: {
            xtype    : "spinnerfield",
            anchor   : '100%',
            value    : 0,
            minValue : 0,
            increment: 10
        },
        flex    : 1,
        width   : '100%',
        items   : [{
            id        : 'user-add-max-questions',
            fieldLabel: 'Max number of queries per hour'
        }, {
            id        : 'user-add-max-updates',
            fieldLabel: 'Max number of updates per hour'
        }, {
            id        : 'user-add-max-connections',
            fieldLabel: 'Max number of connections per hour'
        }, {
            id        : 'user-add-max-user-connections',
            fieldLabel: 'Max number of user connections'
        }]
    }],
    buttons      : [{
        id  : 'user-add-save-user',
        text: 'Save User'
    }, {
        id  : 'user-add-close',
        text: 'Close'
    }],
    initComponent: function () {

        this.callParent(arguments);
    }
});