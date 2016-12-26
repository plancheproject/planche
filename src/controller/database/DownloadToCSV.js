Ext.define('Planche.controller.database.DownloadToCSV', {
    extend: 'Ext.app.Controller',
    views : [
        'Planche.view.database.DownloadToCSV'
    ],
    init  : function() {

        this.control({
            '#download-to-csv-window'    : {
                boxready: this.loadTables
            },
            '#download-to-csv-btn-export': {
                click: this.exportCSV
            },
            '#download-to-csv-btn-close' : {
                click: this.close
            }
        });

        this.callParent(arguments);
    },

    loadTables: function() {

        var app = this.getApplication(),
            api = app.getAPIS(),
            db = app.getSelectedDatabase();

        app.tunneling({
            db     : db,
            query  : api.getQuery('SHOW_ALL_TABLE_STATUS', db),
            success: function(config, response) {

                var grid = Ext.getCmp('download-to-csv-target-list'),
                    data = Planche.DBUtil.getAssocArray(response.fields, response.records);

                grid.store.loadData(data);

            },
            failure: function(config, response) {

                app.openMessage(app.generateQueryErrorMsg(config.query, response.message));
            }
        });
    },

    initWindow: function() {

        var app = this.getApplication();

        Ext.create('Planche.view.database.DownloadToCSV', {
            database   : app.getSelectedDatabase(),
            application: app
        });
    },

    exportCSV: function(btn) {

        // Define the string
        var app = this.getApplication(),
            api = app.getAPIS(),
            tab = app.getActiveConnectTab(),
            db = app.getSelectedDatabase(),
            grid = Ext.getCmp('download-to-csv-target-list'),
            selection = grid.selModel.getSelection(),
            params = {
                type   : 'export',
                host   : tab.getHost(),
                user   : tab.getUser(),
                pass   : tab.getPass(),
                charset: tab.getCharset(),
                port   : tab.getPort(),
                db     : db,
                query  : []
            },
            tunnelingURL = tab.getTunnelingURL();

        if (selection.length === 0) {

            Ext.Msg.alert('Info', 'Please, select to export table(s)');
            return;
        }

        selection.map(function(table, idx) {

            params.query = api.getQuery('SELECT_TABLE', db, table.raw.Name, '*', '');
            params.csv = table.raw.Name;

            var cmd = Planche.Base64.encode(Ext.JSON.encode(params)),
                url = tunnelingURL + "?cmd=" + cmd,
                iframeId = 'download-iframe-' + table.raw.Name,
                iframe = Ext.query('#' + iframeId);

            if (iframe.length === 0) {

                var winEl = btn.up('window').getEl();
                Ext.DomHelper.append(winEl, {
                    tag   : 'iframe',
                    id    : iframeId,
                    src   : url,
                    style : 'display:none'
                });
            }
            else {

                iframe[0].setAttribute('src', url);
            }
        });
    },

    close: function(btn) {

        btn.up('window').destroy();
    }
});
