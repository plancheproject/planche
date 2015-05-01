Ext.define('Planche.view.layout.ConnectTab', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.connect-tab',
    layout  : 'border',
    // title   : config.host_name
    border  : false,
    closable: true,
    width   : '100%',
    height  : 30,
    style   : { "background" : "#E0E0E0" },
    padding : '5px 0px 0px 0px',
    items   : [{
        xtype : 'scheme-tree'
    },{

        xtype : 'query-tab-panel'
    }],
    config      : {
        hostName    : 'localhost', 
        tunnelingURL: 'http://',
        host        : '',
        user        : '',
        pass        : '',
        charset     : 'utf8',
        port        : 3306,
        DBMS        : 'mysql',
        APIS        : Planche.dbms.mysql,
        requestType : 'ajax'
    }
});