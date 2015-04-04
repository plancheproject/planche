Ext.define('Planche.controller.table.TableSchemeTab', {
    extend: 'Ext.app.Controller',
    views : [
        'table.TableSchemeTab'
    ],
    init : function(){

        this.control({
            'table-scheme-tab' : {
                beforeedit: this.beforeEdit,
                edit      : this.edit,
                boxready  : this.initTableSchemeTab
            },
            '#table-scheme-btn-create' : {
                click : this.createTable
            },
            '#table-scheme-btn-insert' : {
                click : this.insertRow
            },
            '#table-scheme-btn-delete' : {
                click : this.deleteRow
            }
        });
    },

    edit : function(editor, e){
                    
        var tab = Ext.getCmp("table-scheme-tab");

        if(e.originalValue != e.value){

            tab.setEdited(true);
        }

        tab.getView().focus();
    },

    beforeEdit : function(editor, e){

        var 
        tab       = Ext.getCmp("table-scheme-tab"),
        app       = this.getApplication(),
        store     = tab.getStore(),
        selModel  = tab.getSelectionModel(),
        selection = selModel.getSelection()[0],
        index     = store.indexOf(selection) + 1;

        if(index == store.getCount()){

            store.insert(store.getCount(), [{}]);
        }
    },

    insertRow : function(btn){

        var tab = btn.up("table-scheme-tab"),
            store = tab.getStore(),
            selModel = tab.getSelectionModel(),
            selection = selModel.getSelection()[0];

        if(selection){

            var index = store.indexOf(selection);
            store.insert(index, [{}]);
        }
        else {

            store.insert(store.getCount(), [{}]);
        }
    },

    deleteRow : function(btn){

        var tab = btn.up("table-scheme-tab"),
            store = tab.getStore(),
            selModel = tab.getSelectionModel(),
            selection = selModel.getSelection()[0],
            cnt = store.getCount();

        if(!selection){ return; }
        if(cnt == 1){ return; }
        if(selModel.getCurrentPosition().row == 0) {

            selModel.move('down');
        }
        else {

            selModel.move('up');
        }

        store.remove(selection);
    },

    createTable : function(btn){

        this[btn.getText().toLowerCase()]();
    },

    create : function(btn){

        var 
        app       = this.getApplication(),
        tab       = btn.up("table-scheme-tab"),
        textfield = btn.up('window').down('textfield');
        table     = textfield.getValue();

        if(!table) {

            textfield.validate();
            return;
        }

        var node = app.getSelectedNode(),
            db   = app.getParentNode(node),
            query = 'CREATE TABLE `'+db+'`.`'+table+'`(',
            primaries = [], fields = [],
            store = tab.getStore();
            
        Ext.Object.each(store.getRange(), function(idx, obj){

            if(!obj.data.field) return;

            var data = obj.data,
                field = '';

            field += '\n\t`'+data.field+'` '+data.type;
            field += data.len ? '('+data.len+')' : '';
            field += data.unsigned == true ? ' UNSIGNED' : '';
            field += data.zerofill == true ? ' ZEROFILL' : '';
            field += data.not_null == true ? ' NOT NULL' : '';
            field += data['default'] ? ' DEFAULT \''+ data['default'] +'\'' : '';
            field += data.auto_incr == true ? ' AUTO_INCREMENT' : '';
            field += data.comment ? ' COMMENT \''+ (data.comment) +'\'' : '';
            fields.push(field);

            if(data.pk == true){

                primaries.push('`'+data.field+'`');
            }
        });
        
        if(primaries.length > 0){

            fields.push('\n\tPRIMARY KEY ('+primaries.join(',')+')');
        }
        query += fields.join(",")+');';

        app.tunneling({
            db : db,
            query : query,
            success : function(config, response){

                var tablesNode = app.getParentNode(node , 2, true);
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

                Ext.Msg.alert('Error', response.message);
            }
        });
    },

    alter : function(btn){

        var 
        app       = this.getApplication(),
        tab       = btn.up("table-scheme-tab"),
        textfield = btn.up('window').down('textfield'),
        table     = textfield.getValue();

        if(!table) {

            return;
        }

        var 
        store         = tab.getStore(),
        node          = app.getSelectedNode(),
        db            = app.getParentNode(node),
        query         = 'ALTER TABLE `'+db+'`.`'+table+'`',
        add_primaries = [],
        del_primaries = [],
        primaries     = [],
        fields        = [];
        
        Ext.Object.each(store.getNewRecords(), function(idx, obj){

            if(!obj.data.field) return;

            var data = obj.data,
                field = '\n\tADD COLUMN';

            field += ' `'+data.field+'` '+data.type;
            field += data.len ? '('+data.len+')' : '';
            field += data.unsigned == true ? ' UNSIGNED' : '';
            field += data.zerofill == true ? ' ZEROFILL' : '';
            field += data.not_null == true ? ' NOT NULL' : '';
            field += data['default'] ? ' DEFAULT \''+data['default']+'\'' : '';
            field += data.auto_incr == true ? ' AUTO_INCREMENT' : '';
            field += data.comment ? ' COMMENT \''+data.comment+'\'' : '';
            fields.push(field);

            if(data.pk == true){

                add_primaries.push('`'+data.field+'`');
            }
        });

        Ext.Object.each(store.getRemovedRecords(), function(idx, obj){

            if(!obj.raw.field) return;

            var field = '\n\tDROP COLUMN `'+obj.raw.field+'`';
            fields.push(field);

            if(obj.raw.pk == true){

                del_primaries.push('`'+obj.raw.field+'`');
            }
        });

        Ext.Object.each(store.getUpdatedRecords(), function(idx, obj){

            if(!obj.data.field) return;

            var data = obj.data,
                field = '\n\tCHANGE `'+obj.raw.field+'`';

            field += ' `'+data.field+'` '+data.type;
            field += data.len ? '('+data.len+')' : '';
            field += data.unsigned == true ? ' UNSIGNED' : '';
            field += data.zerofill == true ? ' ZEROFILL' : '';
            field += data.not_null == true ? ' NOT NULL' : '';
            field += data['default'] ? ' DEFAULT \''+data['default']+'\'' : '';
            field += data.auto_incr == true ? ' AUTO_INCREMENT' : '';
            field += data.comment ? ' COMMENT \''+data.comment+'\'' : '';
            fields.push(field);

            if(obj.raw.pk == true){

                if(data.pk != true){

                    del_primaries.push('`'+data.field+'`');
                }
            }
            else if(obj.raw.pk != true && data.pk == true){

                add_primaries.push('`'+data.field+'`');
            }
        });

       
        if(del_primaries.length > 0 || add_primaries.length > 0){

            fields.push('DROP PRIMARY KEY');
            var primaries = [];
            Ext.Object.each(store.getRange(), function(idx, obj){

                if(obj.data.pk == true){

                    primaries.push('`'+obj.data.field+'`');
                }
            });
            fields.push('ADD PRIMARY KEY('+Ext.Array.merge(primaries, add_primaries).join(",")+')');
        }

        query += fields.join(",")+';';

        app.tunneling({
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

    initTableSchemeTab : function(tab){

        var 
        app      = this.getApplication(),
        db       = tab.getDatabase(),
        tb       = tab.getTable(),
        getMatch = function(str, pattern, idx){ 

            var r = str.match(pattern); 
            if(r) r = r[idx];
            return r;
        },
        records = [];

        if(!tb){

            records.push({});
            tab.getStore().loadData(records);
            return;
        }

        //load table fileds list
        app.tunneling({
            db : db,
            query : app.getAPIS().getQuery('SHOW_FULL_FIELDS', db, tb),
            success : function(config, response){

                Ext.Object.each(response.records, function(idx, row){

                    var 
                    type     = getMatch(row[1], /[a-zA-Z]+/, 0),
                    len      = getMatch(row[1], /\((.*)\)/, 1),
                    unsigned = getMatch(row[1], /unsigned/, 0),
                    zerofill = getMatch(row[1], /zerofill/, 0);

                    records.push({
                        'field'    : row[0],
                        'type'     : type,
                        'len'      : len, 
                        'default'  : row[5] == "NULL" ? "" : row[5],
                        'pk'       : row[4] == "PRI" ? true : false,
                        'not_null' : row[3] == "NO" ? true : false,
                        'unsigned' : unsigned,
                        'auto_incr': row[6] == "auto_increment" ? true : false,
                        'zerofill' : zerofill,
                        'comment'  : row[8]
                    });
                });

                records.push({});
                tab.getStore().loadData(records);
            }
        });
    }
});