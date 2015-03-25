Ext.define('Planche.Application', {
    name: 'Planche',

    extend: 'Ext.app.Application',
    requires : [
        'Ext.data.JsonP',
        'Ext.window.MessageBox',
        'Planche.lib.Window',
        'Planche.lib.Menu',
        'Planche.lib.QueryTokenType',
        'Planche.lib.Query',
        'Planche.lib.QueryParser',
        'Planche.lib.QueryAlignment',
        'Planche.dbms.mysql',
    ],
    views: [
        // TODO: add views here
    ],

    controllers: [
        // TODO: add controllers here,
        'Planche.controller.command.Find',
        'Planche.controller.command.Flush',
        'Planche.controller.command.Process',
        'Planche.controller.command.Quick',
        'Planche.controller.command.Status',
        'Planche.controller.command.Variables',
        'Planche.controller.connection.Connect',
        'Planche.controller.database.CreateDatabase',
        'Planche.controller.menu.Connection',
        'Planche.controller.menu.Database',
        'Planche.controller.menu.Edit',
        'Planche.controller.menu.Table',
        'Planche.controller.menu.Tools',
        // 'Planche.controller.menu.Favorites',
        // 'Planche.controller.menu.Help',
        // 'Planche.controller.menu.Other',
        // 'Planche.controller.menu.Powertools',
        // 'Planche.controller.menu.Window'


        'Planche.controller.query.Token',
        'Planche.controller.table.AdvancedProperties',
        'Planche.controller.table.EditScheme',
        'Planche.controller.table.EditTextColumn',
        'Planche.controller.table.ReorderColumns',
        'Planche.controller.user.Users',
        'Planche.controller.Main'
    ],

    stores: [
        // TODO: add stores here
    ]
});
