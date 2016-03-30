Ext.define('Planche.view.table.EditSchemaWindow', {
    extend  : 'Planche.lib.Window',
    stateful  : true,
    layout    : 'fit',
    bodyStyle :"background-color:#FFFFFF",
    width     : 1000,
    height    : 500,
    overflowY : 'auto',
    autoScroll: true,
    border    : false,
    modal     : true,
    plain     : true,
    fixed     : true,
    shadow    : false,
    autoShow  : true,
    constrain : true,
    buttons   : [{
        id     : 'edit-schema-btn-close',
        text   : 'Close'
    }]
});