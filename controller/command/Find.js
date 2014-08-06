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
                { xtype: 'button', text: '.*', cls : 'btn', scope: this, handler : function(btn){

                    btn.toggle();
                }},
                { xtype: 'button', text: 'Aa', cls : 'btn', scope: this, handler : function(btn){

                    btn.toggle();
                }},
                { xtype: 'button', text: '\"\"', cls : 'btn', scope: this, handler : function(btn){

                    btn.toggle();
                }},
                { xtype: 'button', text: 'Wrap', cls : 'btn', scope: this, handler : function(btn){

                    btn.toggle();
                }},
                { xtype: 'button', text: 'In Selection', cls : 'btn', scope: this, handler : function(btn){

                    btn.toggle();
                }},
                { xtype: 'button', text: 'Highlight', cls : 'btn', scope: this, handler : function(btn){

                    btn.toggle();
                }},
                findText,
                { xtype: 'button', text: 'Find', cls : 'btn',¬ scope: this, handler : function(btn){

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

        var pos = { line : 0, ch : 0 };
        CodeMirror.commands.find = function(cm) { 
            
            var cursor = cm.getCursor();
            pos = pos.line == cursor.line && pos.ch == cursor.ch ? pos : cm.getCursor();

            var sword = 'e';

            if(!sword){

                return;
            }
            var lastLine = cm.lastLine();
            var regexp = new RegExp(sword, "gi");
            var match;
            var sel = [];
            var all = false;
            var index = 0;
            var from = 0, to = 0;
            var str = '';
            var prev = false;


            //라인을 검사하여 마지막에 위치해 있는경우 멈춘다.
            if(pos.line == lastLine && pos.ch){

            }

            lineLoop:
            while(typeof (str = cm.getLine(pos.line)) != "undefined"){

                currLine = pos.line;

                // if(prev){

                //     str = str.slice(0, )
                // } 

                while ((match = regexp.exec(str)) != null) {

                    from = match.index;
                    to = from + match[0].length;

                    console.log(pos.ch, to);
                    //debugger;
                    if(pos.ch >= to){

                        continue;
                    }

                    sel.push({
                        anchor : { line : currLine, ch : from }, 
                        head : { line : currLine, ch : to }
                    });

                    pos = {line : currLine, ch : to };

                    if(all == false){
     
                        break lineLoop;
                    }
                }
                
                if(prev){

                    currLine--;

                    if(currLine < 0){

                        if(all){

                            currLine = lastLine;
                        }
                        else {

                            currLine = 0;
                        }
                    }
                }
                else {

                    currLine++;

                    if(currLine > lastLine){

                        if(all){

                            currLine = 0;
                        }
                        else {

                            currLine = lastLine;
                        }
                    }
                }

                pos = { line : currLine, ch : 0};
            }

            cm.setSelections(sel);
        };


        CodeMirror.commands.findPrev = function(cm) { 
            
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