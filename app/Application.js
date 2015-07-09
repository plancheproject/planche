Ext.define('Planche.Application', {
    name: 'Planche',

    extend: 'Ext.app.Application',
    requires : [
        'Planche.lib.Window',
        'Planche.lib.Menu',
        'Planche.lib.QueryTokenType',
        'Planche.lib.Query',
        'Planche.lib.QueryParser',
        'Planche.lib.QueryAlignment',
        'Planche.dbms.mysql',
        'Planche.overrides.FixMenuBug',
        'Planche.overrides.RadioGroup'
    ],
    views: [
        'layout.ConnectTab',
        'layout.HistoryTab',
        'layout.InfoTab',
        'layout.MessageTab',
        'layout.QueryEditor',
        'layout.QueryTab',
        'layout.QueryTabPanel',
        'layout.ResultTabPanel',
        'layout.SchemeTree',
        'layout.TableDataTab',
        'layout.Toolbar',

        'table.EditIndexWindow',
        'table.EditSchemeWindow',
        'table.TableIndexesTab',
        'table.TableInfoTab',
        'table.TablePropertiesTab',
        'table.TableSchemeTab',
        'table.TableSQLTab',

        'user.Grant',
        'user.GrantSchemeTree',
        'user.GrantUserList',
        'user.GrantPrivList',
        'user.UserAdd'
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
        'connection.NewConnect',
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
        'layout.ConnectTab',
        'layout.Toolbar',

        'table.EditIndexWindow',
        'table.EditSchemeWindow',
        'table.AdvancedProperties',
        'table.EditTextColumn',
        'table.ReorderColumns',
        'table.TableSchemeTab',
        'table.TablePropertiesTab',
        'table.TableIndexesTab',
        'table.TableSQLTab',
        'table.TableInfoTab',

        'Main',

        'user.Grant',
        'user.UserAdd'
    ],

    stores: [
        'GrantSchemeTree',
        'SchemeTree'
    ]
});
