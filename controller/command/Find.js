Ext.define('Planche.controller.command.Find', {
    extend: 'Ext.app.Controller',

    initWindow : function(records){

        var mainTab = this.application.getMainTab();
        var findText = Ext.create('Ext.form.field.Text', {
            flex : 1, scope: this, listeners : {
                specialkey: function (field, el) {

                    if (el.getKey() == Ext.EventObject.ENTER){
                        
                        this.find();
                    }
                }
            }
        });

        Ext.create('Planche.lib.Window', {
            id : 'window-'+this.id,
            stateful: true,
            layout: 'hbox',
            bodyStyle:"background-color:#FFFFFF",
            width : Ext.getBody().getViewSize().width,
            height: 40,
            modal : false,
            // plain: true,
            // fixed : true,
            // frame:true,
            shadow : false,
            constrain : true,
            bodyPadding : '5 5 5 5',
            headerPosition : 'right',
            buttonAlign : 'left',
            defaultAlign : 'bl-bl',
            defaults : {

                margin : '0 5 0 0'
            },
            items : [
                findText,
                { xtype: 'button', text: 'Find', cls : 'btn', scope: this, handler : function(btn){

                    this.find();
                }},
                { xtype: 'button', text: 'Find Prev', cls : 'btn', scope: this, handler : function(btn){

                    this.findPrev();
                }},
                { xtype: 'button', text: 'Find All', cls : 'btn', margin : '0 0 0 0', scope: this, handler : function(btn){

                    this.findAll();
                }}
            ]
        }).showBy(Ext.getBody());

        CodeMirror.commands.find = function(cm) { 
            
            cm.setSelection({line :1, ch:1},{line :1, ch:10});

            Ext.Array.each([2, 3, 4, 5, 6, 7, 8], function(item, idx){

                cm.addSelection({line : item, ch:1}, {line :item, ch:10});
            });
        };

    },

    find : function(){

        var editor = this.application.getActiveEditor();
        editor.execCommand('find');
    },

    findPrev : function(){

        var editor = this.application.getActiveEditor();
        editor.execCommand('findPrev');
    },

    findAll : function(){

    },
});