Ext.define('Planche.view.table.EditSchemeWindow', {
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
    items     : [
    
    ],
    buttons   : [{
        id     : 'edit-scheme-btn-close',
        text   : 'Close'
    }]
});