Ext.define('Planche.controller.command.Quick', {
    extend: 'Ext.app.Controller',

    initWindow : function(records){

        var app = this.getApplication();

        var tree = app.getSelectedTree();
        var dbNode = app.getParentNode(app.getSelectedNode(), 1, true);
        var db = dbNode.data.text;
        var tablesNode = dbNode.findChild('text', 'Tables');

        tree.fireEvent('expandTree', tablesNode)

        var cmd = [
            { name : 'Paste Select', method : app.pasteSQLStatement, params : ['select'] },
            { name : 'Paste Update', method : app.pasteSQLStatement, params : ['update'] },
            { name : 'Paste Delete', method : app.pasteSQLStatement, params : ['delete'] },
            { name : 'Paste Insert', method : app.pasteSQLStatement, params : ['insert'] },
            { name : 'Alter Table ', method : app.openAlterTableWindow  },
            { name : 'Rename Table', method : app.renameTable },
            { name : 'Truncate Table', method : app.truncateTable },
            { name : 'Drop Table From Database', method : app.dropTable },
            { name : 'Reorder Column(s)', method : app.openReorderColumns },
            // { name : 'Duplicate Table Structure/Data', method : app.pasteSQLStatement, params : ['select'] },
            { name : 'View Advanced Properties', method : app.openAdvancedProperties  }

            // { name : 'Change Table To Type', method : app.pasteSQLStatement, params : ['select'] }
        ];

        var cmds = [];
        Ext.Array.each(records.records, function(obj, idx){

            Ext.Array.each(cmd, function(obj2, idx2){

                cmds.push({
                    name : obj2.name + " "+ obj[0], 
                    value : idx2,
                    db : db,
                    table : obj[0]
                });
            });
        });

        var columns = this.makeListColumns();

        var fields = ['name', 'value'];

        var task = new Ext.util.DelayedTask();

        this.window = Ext.create('Ext.panel.Panel', {
            id : 'window-'+this.id,
            stateful: true,
            title : 'Connect to MySQL Host',
            layout: 'fit',
            bodyStyle:"background-color:#FFFFFF",
            width : 500,
            border : false,
            toFrontOnShow : true,
            floating : true,
            modal : false,
            header : false,
            fixed : true,
            shadow : false,
            items : [
                {
                    xtype : 'combo',
                    id : 'quick-combo',
                    typeAhead: false,
                    hideLabel: true,
                    hideTrigger:true,
                    displayField: 'name',
                    valueField: 'value',
                    queryMode: 'local',
                    forceSelection : true,
                    triggerAction: 'all',
                    loadingText: 'Searching...',
                    valueNotFoundText : 'This command is not found',
                    fixed : true,
                    store: Ext.create('Ext.data.Store', {
                        fields:fields,
                        data: cmds
                    }),
                    listeners : {
                        scope : this,
                        select : function(combo, records){

                            var selData = records[0].raw;
                            var selCommand = cmd[selData.value];

                            var node = dbNode.findChild('text', selData.table, 1);

                            var selParams = Ext.Array.merge(selCommand.params || [], [node]);
                            selCommand.method.apply(app, selParams);

                            try {

                                var panel = combo.up('panel');
                                panel.destroy();
                            }
                            catch(e){

                            }

                            return ;
                        },
                        boxready : function(combo){
                            
                            task.delay(100, function(combo){

                                combo.doQuery('');

                            }, this, [combo]);
                        },
                        activate : function(combo){
                            //console.log('activate', combo);
                        // Ext.getCmp('quick-combo').focus();
                        // Ext.getCmp('quick-combo').focusInput();
                        }
                    }
                }
            ]
        });

        this.window.show();
        this.window.setY(0);

        return this.window;
    },

    makeListColumns : function(){   
        
        return [
            { name: 'cmd' }
        ];
    }
});