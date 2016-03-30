/**
 * Planche viewport
 *
 * @class Planche.view.Viewport
 */
Ext.define('Planche.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires:[
        'Ext.layout.container.Fit',
        'Planche.view.Main'
    ],

    layout: {
        type: 'fit'
    },

    items: [{
        xtype: 'app-main'
    }]
});