Ext.define('Planche.controller.database.CreateDatabase', {
    extend: 'Ext.app.Controller',
    initWindow : function(db, result){

        this.isAlter = (db && result) ? true : false;

        Ext.create('Planche.lib.Window', {
            stateful: true,
            title : this.isAlter ? 'Alter database \''+tb+'\' in \''+db+'\'' : 'Create new database',
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

        var combo = this.initComboBox('database-collation', [
            {id : '', text : 'Database Collation'}
        ], '');

        var app = this.getApplication();

        app.tunneling({
            query : app.getEngine().getQuery('SHOW_DATABASE'),
            success : function(config, response){

                var store = combo.getStore();

                Ext.Array.each(response.records, function(row, idx){

                    store.insert(0, row);
                });
            },
            failure : function(config, response){

                Ext.Msg.alert('Error', response.result.message);
            }
        });

        return combo;
    },

    initDatabaseCharSet : function(){

        var combo = this.initComboBox('database-charset', [
            {id : '', text : 'Database Charset'}
        ], '');

        var app = this.getApplication();

        app.tunneling({
            query : app.getEngine().getQuery('SHOW_DATABASE'),
            success : function(config, response){

                var store = combo.getStore();

                Ext.Array.each(response.records, function(row, idx){

                    store.insert(0, row);
                });
            },
            failure : function(config, response){

                Ext.Msg.alert('Error', response.result.message);
            }
        });

        return combo;
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
                    text : table,
                    icon : 'images/icon_table.png',
                    leaf : false,
                    children : [{
                        text : 'Columns',
                        leaf : false
                    }, {
                        text : 'Indexes',
                        leaf : false
                    }]
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