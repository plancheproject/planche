Ext.define('Planche.controller.command.Quick', {
    extend: 'Ext.app.Controller',

    initWindow: function() {

        var app = this.getApplication();
            fields = ['name', 'icon', 'value'],
            win = Ext.create('Ext.window.Window', {
                id       : 'window-' + this.id,
                title    : 'Quick Command',
                layout   : 'fit',
                width    : 500,
                border   : false,
                constrain: true,
                modal    : true,
                header   : false,
                fixed    : true,
                shadow   : false,
                items    : [
                    {
                        xtype            : 'combo',
                        id               : 'quick-combo',
                        typeAhead        : false,
                        hideLabel        : true,
                        hideTrigger      : true,
                        displayField     : 'name',
                        valueField       : 'value',
                        queryMode        : 'local',
                        forceSelection   : true,
                        anyMatch         : true,
                        triggerAction    : 'all',
                        focusOnToFront   : true,
                        loadingText      : 'Searching...',
                        valueNotFoundText: 'This command is not found',
                        fixed            : true,
                        store            : Ext.create('Ext.data.Store', {
                            fields: fields,
                            data  : app.getActiveQuickCommands()
                        }),
                        listConfig : {

                            loadingText: 'Search..',
                            getInnerTpl: function() {
                                console.log(arguments);
                                ///baackround:url(resources/images/icon_database.png)
                                return '<div class="quick-command"><span class="quick-icon {icon}"></span> {name}</div>';
                            }
                        },
                        listeners        : {
                            scope : this,
                            select: function(combo, records) {

                                var selData = records[0].raw;
                                selData.method.apply(app, selData.params);

                                try {

                                    combo.reset();
                                    var panel = combo.up('panel');
                                    panel.hide();
                                }
                                catch (e) {

                                }
                            }
                        }
                    }
                ],
                listeners: {
                    activate : function(win){
                        var combo = Ext.getCmp('quick-combo'),
                            task = new Ext.util.DelayedTask();
                        task.delay(100, function(combo) {

                            combo.focus();

                            task.delay(200, function(combo) {

                                combo.doQuery('');

                            }, this, [combo]);

                        }, this, [combo]);
                    }
                }
            });

        win.show();
        win.setY(100);

        return win;
    }
});