Ext.define('Planche.controller.database.CreateDatabase', {
    extend: 'Ext.app.Controller',
    initWindow : function(node){

        this.isAlter = node ? true : false;

        var db;

        if(this.isAlter){

            db = node.data.text;
        }

        Ext.create('Planche.lib.Window', {
            stateful: true,
            title : this.isAlter ? 'Alter database \''+db+'\'' : 'Create new database',
            layout : 'vbox',
            bodyStyle:"background-color:#FFFFFF",
            width : 300,
            height: 200,
            bodyPadding : '10px 10px 10px 10px',
            overflowY: 'auto',
            autoScroll : true,
            modal : true,
            plain: true,
            fixed : true,
            shadow : false,
            autoShow : true,
            constrain : true,
            items : [
                this.initDatabaseName(db),
                this.initDatabaseCharSet(),
                this.initDatabaseCollation()
            ],
            buttons : [{
                text : this.isAlter ? 'Alter' : 'Create',
                scope : this,
                handler : this.isAlter ? this.alter : this.create,
            },{
                text : 'Cancel',
                scope : this,
                handler : this.cancel
            }],
            listeners: {
                scope : this,
                boxready : function(){

                    this.loadCollation();
                    this.loadCharset();
                }
            }
        });
    },

    initDatabaseName : function(database){

        return {
            xtype : 'textfield',
            width : '100%',
            allowBlank: false,
            emptyText : 'Enter new database name..',
            disabled : this.isAlter,
            value : this.isAlter ? database : ''
        };
    },
    
    initDatabaseCollation : function(){

        this.comboCollation = this.initComboBox('database-collation', [
            {id : '', text : 'Database Collation'}
        ], '');


        return this.comboCollation;
    },

    initDatabaseCharSet : function(){

        this.comboCharset = this.initComboBox('database-charset', [
            {id : '', text : 'Database Charset'}
        ], '');

        return this.comboCharset;
    },

    loadCollation : function(){

        var app = this.getApplication();
        var me = this;

        app.tunneling({
            query : app.getEngine().getQuery('SHOW_COLLATION'),
            success : function(config, response){

                var store = me.comboCollation.store;

                var tmp = [];
                Ext.Array.each(response.records, function(row, idx){

                    tmp.push({
                        id : row[0],
                        text : row[0]
                    });
                });

                debugger;
                store.loadData(tmp);

            },
            failure : function(config, response){

                Ext.Msg.alert('Error', response.result.message);
            }
        });
    },

    loadCharset : function(){

        var app = this.getApplication();
        var me = this;

        app.tunneling({
            query : app.getEngine().getQuery('SHOW_CHARSET'),
            success : function(config, response){

                var store = me.comboCharset.store;

                var tmp = [];
                Ext.Array.each(response.records, function(row, idx){

                    tmp.push({
                        id : row[0],
                        text : row[0]
                    });
                });

                store.loadData(tmp);
            },
            failure : function(config, response){

                Ext.Msg.alert('Error', response.result.message);
            }
        });
    },

    initComboBox : function(name, data, emptyText){

        var store = new Ext.data.Store({
            fields: ['id','text'],
            data : data
        });

        // Simple ComboBox using the data store
        var combo = Ext.create('Ext.form.ComboBox', {
            width : '100%',
            name : name,
            emptyText : emptyText,
            value: '',
            displayField : 'text',
            valueField: 'id',
            labelWidth: 80,
            editable : false,
            store: store,
            typeAhead: true
        });

        return combo;
    },

    create : function(btn){

        var textfield = btn.up('window').down('textfield');
        var table = textfield.getValue();
        if(!table) {

            textfield.validate();
            return;
        }

        var node = this.getApplication().getSelectedNode(),
            db   = this.getApplication().getParentNode(node);

        this.getApplication().tunneling({
            db : db,
            query : query,
            success : function(config, response){

                var tablesNode = this.getApplication().getParentNode(node , 1, true);
                tablesNode.appendChild({
                    text : db,
                    icon : 'images/icon_database.png',
                    leaf : false,
                    children : []
                });

                btn.up('window').destroy();
            },
            failure : function(config, response){

                Ext.Msg.alert('Error', response.result.message);
            }
        });
    },

    alter : function(btn){

        var store = this.grid.getStore();
        
        var node = this.getApplication().getSelectedNode();
        var db   = this.getApplication().getParentNode(node);

        this.getApplication().tunneling({
            db : db,
            query : query,
            success : function(config, response){

                Ext.Object.each(node.childNodes, Ext.Function.bind(function(idx, child){

                    if(child.childNodes.length > 0){

                        this.reloadTree(child);
                    }
                }, this));
                
                btn.up('window').destroy();
            },
            failure : function(config, response){

                Ext.Msg.alert('Error', response.result);
            }
        });
    },

    cancel : function(btn){

        if(this.grid.isEdited){

            Ext.Msg.confirm('Cancel', 'You will lose all changes. Do you want to quit?', function(btn, text){

                if (btn == 'yes'){

                    this.up('window').destroy();
                }
            }, btn);
        }
        else {

            btn.up('window').destroy();
        }
    }
});