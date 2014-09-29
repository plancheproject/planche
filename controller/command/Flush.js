Ext.define('Planche.controller.command.Flush', {
    extend: 'Ext.app.Controller',
    grid : null,
    initWindow : function(){

        Ext.create('Planche.lib.Window', {
            id : 'window-'+this.id,
            stateful: true,
            title : 'Flush',
            layout: {
                type: 'table',
                columns: 2,
                tableAttrs: {
                    style: {
                        width: '100%'
                    }
                },
                tdAttrs: {
                   style:{
                       width: '50%',
                       'vertical-align' : 'top'
                   }
                }
            },
            bodyPadding : '5 5 5 5',
            bodyStyle:"background-color:#FFFFFF",
            width : 400,
            height: 300,
            overflowY: 'auto',
            autoScroll : true,
            modal : true,
            plain: true,
            fixed : true,
            shadow : false,
            autoShow : true,
            constrain : true,
            items : [
                this.initCheckBox('Use NO_WRITE_TO_BINLOG', 'NO_WRITE_TO_BINLOG', 2),
                this.initCheckBox('FLUSH ALL', 'ALL', 2),
                this.initCheckBox('Logs', 'LOGS'),
                this.initCheckBox('Hosts', 'HOSTS'),
                this.initCheckBox('Privileges', 'PRIVILEGES'),
                this.initCheckBox('Status', 'STATUS'),
                this.initCheckBox('Tables', 'TABLES'),
                this.initCheckBox('Tables with read lock', 'TABLES WITH READ LOCK'),
                this.initCheckBox('DES_KEY_FILE', 'DES_KEY_FILE'),
                this.initCheckBox('QUERY_CACHE', 'QUERY_CACHE'),
                this.initCheckBox('USER_RESOURCES', 'USER_RESOURCES', 2)
            ],
            buttons : [{
                text : 'Flush',
                scope : this,
                handler : this.flush
            },{
                text : 'Close',
                scope : this,
                handler : this.close
            }]
        });
    },

    initCheckBox : function(label, cmd, colspan){

        var component = {
            xtype : 'checkbox',
            boxLabel : label,
            cmd : cmd,
            handler : this.hanlderCheckBox
        };

        if(typeof colspan != "undefined"){

            component.colspan = colspan;
        }

        return component;
    },

    hanlderCheckBox : function(checkbox, checked){

        if(checkbox.cmd == 'ALL'){

            var node = checkbox.nextNode();
            while(node){

                node.setValue(checked);
                node = node.nextNode();
            }
            return;
        }
    },

    flush : function(btn, e){
        
        var win = btn.up("window");      
        var checkAll = win.down("checkbox[boxLabel='FLUSH ALL']");
        var useNoWrite = win.down("checkbox[boxLabel='Use NO_WRITE_TO_BINLOG']");

        if(useNoWrite.checked){

            useNoWrite = useNoWrite.cmd;
        }
        else {

            useNoWrite = '';
        }
        
        var queries = [];
        var node = win.down("checkbox[boxLabel='Logs']");
        while(node){

            if(node.checked){

                queries.push('FLUSH ' + (useNoWrite ? useNoWrite+' ' : '') + node.cmd);
            }
            node = node.nextNode();
        }

        if(queries.length == 0){

            Ext.Msg.alert('info', 'Must select any command');
            return;
        }

        this.execute(queries, win);
    },

    close : function(btn, e){
        
        var win = btn.up('window');
        win.destroy();
    },

    execute : function(queries, win){
            
        var app  = this.getApplication(),
            node = app.getSelectedNode(),
            db   = app.getParentNode(node);

        win.setLoading(true);

        var tunneling,
            messages = [];
        (tunneling = Ext.Function.bind(function(){

            var query = queries.shift();

            if(query) {
            
                app.tunneling({
                    db : db,
                    query : query,
                    success : function(config, response){

                        tunneling();
                    },
                    failure : function(config, response){

                        Ext.Msg.alert('info', query+'<span class=\'query_err\'>▶ '+response.message+'</span>');
                        win.setLoading(false);
                    }
                })
            }
            else {

                Ext.Msg.alert('info', 'Success');
                win.setLoading(false);
                win.destroy();
            }

        }, this))();
    }
});