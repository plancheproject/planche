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
        'Planche.dbms.mysql'
    ],
    views: [
        // TODO: add views here
    ],

    controllers: [
        // TODO: add controllers here,
        'command.Find',
        'command.Flush',
        'command.Process',
        'command.Quick',
        'command.Status',
        'command.Variables',
        'connection.Connect',
        'database.CreateDatabase',
        'menu.Connection',
        'menu.Database',
        'menu.Edit',
        'menu.Table',
        'menu.Tools',
        // 'menu.Favorites',
        // 'menu.Help',
        // 'menu.Other',
        // 'menu.Powertools',
        // 'menu.Window'
        'query.Token',

        'layout.SchemeTreeContextMenu',
        'layout.SchemeTree',
        'layout.QueryTabPanel',
        'layout.QueryEditor',
        'layout.ResultTabPanel',
        'layout.QueryTab',
        'layout.MessageTab',
        'layout.TableDataTab',
        'layout.InfoTab',
        'layout.HistoryTab',
        'layout.Toolbar',
        'layout.ConnectTab',

        'table.EditSchemeWindow',
        'table.AdvancedProperties',
        'table.EditTextColumn',
        'table.ReorderColumns',
        'table.TableSchemeTab',
        'table.TablePropertiesTab',
        'table.TableIndexesTab',
        'table.TableSQLTab',
        'table.TableInfoTab',

        'user.Users',

        'Main'
    ],

    stores: [
        // TODO: add stores here
    ]
});
