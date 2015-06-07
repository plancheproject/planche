Ext.define('Planche.view.layout.Toolbar', {
    extend  : 'Ext.toolbar.Toolbar',
    xtype   : 'planche-toolbar',
    width   : '100%',
    defaults:{
        xtype       : 'button',
        allowDepress: false,
        scale       : 'medium',
        tooltipType : 'title',
        scope       : this,
        disabled    : true
    },
    items : [
        {
            icon    : 'resources/images/new_database.png',
            tooltip : 'Create a new connection(ALT+N)',
            id      : 'toolbar-new-connect',
            disabled: false
        },
        {
            icon   : 'resources/images/new_query.png',
            tooltip: 'New query editor(ALT+T)',
            id     : 'toolbar-query-editor'
        },
        {
            icon   : 'resources/images/icon_play24x24.png',
            tooltip: 'Query Execution(F9)',
            id     : 'toolbar-query-exec'
        },
        {
            icon   : 'resources/images/icon_stop24x24.png',
            tooltip: 'Stop Operations(ALT+S)',
            id     : 'toolbar-stop-operation'
        },
        {
            icon   : 'resources/images/icon_user24x24.png',
            tooltip: 'User Manager(ALT+U)',
            id     : 'toolbar-user-manager'
        },
        '-',
        {
            text: 'Quick Cmd',
            cls : 'btn',
            id  : 'toolbar-quick-command'
        },
        '-',
        {
            text: 'Procs',
            cls : 'btn',
            id  : 'toolbar-show-procs'
        },
        {
            text: 'Vars',
            cls : 'btn',
            id  : 'toolbar-show-vars'
        },
        {
            text  : 'Status',
            id    : 'toolbar-show-status',
            cls   : 'btn',
            margin: '0px 6px 0px 0px'
        },
        {
            text  : 'Flush',
            id    : 'toolbar-flush',
            cls   : 'btn',
            margin: '0px 6px 0px 0px'
        },
        '-',
        {
            icon  : 'resources/images/icon_sql.png',
            text  : 'Tokenize',
            id    : 'toolbar-tokenize',
            cls   : 'btn',
            margin: '0px 2px 0px 3px'
        }
        //            {
                    // icon : 'resources/images/icon_sql.png',
        //             text : 'Prepare',
        //             cls : 'btn',
        //             scope : this,
        //             handler : function (btn) {

        //             }
        //            }
    ]
    
});