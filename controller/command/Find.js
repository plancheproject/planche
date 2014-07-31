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

        CodeMirror.commands.findAll = function(cm) { 
            
            var cursor = cm.getCursor();
            
            var line = cm.getLine(cursor.line);
            var last = cursor.line;

            var sword = findText.getValue();

            if(!sword){

                return;
            }

            var regexp = new RegExp(sword, "gi");
            var match;
            var sel = [];
            while(typeof line != "undefined"){

                while ((match = regexp.exec(line)) != null) {

                    sel.push({
                        anchor : { line : last, ch : match.index }, 
                        head : { line : last, ch : match.index + match[0].length }
                    });
                }
                
                last++;

                line = cm.getLine(last);
            }
            
            cm.setSelections(sel);
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

        var editor = this.application.getActiveEditor();
        editor.execCommand('findAll');
    },
});