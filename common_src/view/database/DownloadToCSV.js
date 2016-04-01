Ext.define('Planche.view.database.DownloadToCSV', {
    extend       : 'Planche.lib.Window',
    id           : 'download-to-csv-window',
    title        : 'Download To CSV',
    stateful     : true,
    bodyStyle    : "background-color:#FFFFFF",
    width        : 600,
    height       : 500,
    border       : false,
    modal        : true,
    plain        : true,
    fixed        : true,
    shadow       : false,
    autoShow     : true,
    constrain    : true,
    config       : {
        database   : null,
        application: null
    },
    initComponent: function() {

        var app = this.getApplication();

        this.items = [{
            xtype: 'download-to-csv-target-list',
            title: 'Select to export target',
            id   : 'download-to-csv-target-list'
        }];

        this.callParent(arguments);
    },
    buttons      : [{
        id  : 'download-to-csv-btn-export',
        text: 'Export'
    }, {
        id  : 'download-to-csv-btn-close',
        text: 'Close'
    }]
});