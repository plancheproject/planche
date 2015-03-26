Ext.define('Planche.controller.table.EditScheme', {
    extend: 'Ext.app.Controller',
    initWindow : function(db, tb, result){

        this.isAlter = (tb && result) ? true : false;

        Ext.create('Planche.lib.Window', {
            stateful: true,
            title : this.isAlter ? 'Alter Table \''+tb+'\' in \''+db+'\'' : 'Create new table',
            layout : 'fit',
            bodyStyle:"background-color:#FFFFFF",
            width : 1000,
            height: 500,
            overflowY: 'auto',
            autoScroll : true,
            modal : true,
            plain: true,
            fixed : true,
            shadow : false,
            autoShow : true,
            constrain : true,
            items : this.initTabPanel(db, tb, result),
            buttons : [{
                text : this.isAlter ? 'Alter' : 'Create',
                scope : this,
                handler : this.isAlter ? this.alter : this.create
            },{
                text : 'Insert',
                scope : this,
                handler : this.insertRow
            },{
                text : 'Delete',
                scope : this,
                handler : this.deleteRow
            },{
                text : 'Cancel',
                scope : this,
                handler : this.cancel
            }],
            listeners: {
                scope : this,
                boxready : function(){

                    if(this.isAlter){

                        this.initAlterTable();
                    }
                    else {

                        this.initCreateTable();
                    }
                }
            }
        });
    },

    initTabPanel : function(db, tb, result){

        return {
            xtype : 'tabpanel',
            items : [
                this.initGrid(db, tb, result),
                this.initTablePropertiesTab(),
                this.initTableIndexexTab(),
                this.initTableSQLTab(),
                this.initTableInfoTab()
            ]
        }
    },

    initGrid : function(db, tb, result){

        var getMatch = function(str, pattern, idx){ 
            var r = str.match(pattern); 
            if(r) r = r[idx];
            return r;
        };

        var records = [];
        if(result){

            Ext.Object.each(result.records, function(idx, row){

                var type = getMatch(row[1], /[a-zA-Z]+/, 0);
                var len = getMatch(row[1], /\((.*)\)/, 1);
                var unsigned = getMatch(row[1], /unsigned/, 0);
                var zerofill = getMatch(row[1], /zerofill/, 0);

                records.push({
                    field     : row[0],
                    type      : type,
                    len    : len, 
                    'default' : row[5] == "NULL" ? "" : row[5],
                    pk        : row[4] == "PRI" ? true : false,
                    not_null  : row[3] == "NO" ? true : false,
                    unsigned  : unsigned,
                    auto_incr : row[6] == "auto_increment" ? true : false,
                    zerofill  : zerofill,
                    comment   : row[8]
                });
            });
        }

        var selModel = Ext.create('Ext.selection.CheckboxModel', {
            mode : 'multi'
        });

        var columns = this.makeListColumns();

        var fields = [];
        Ext.each(columns, function(obj){

            fields.push(obj.dataIndex);
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            id : 'table-window',
            border : false,
            isEdited : false,
            title : 'Table Scheme',
            selModel: {
                selType: 'cellmodel'
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2
                })
            ],
            columnLines: true,
            width : '100%',
            tbar : {
                xtype : 'textfield',
                width : '100%',
                allowBlank: false,
                emptyText : 'Enter new table name..',
                disabled : this.isAlter,
                value : this.isAlter ? tb : ''
            },
            flex  : 1,
            columns : columns,
            store: Ext.create('Ext.data.Store', {
                clearRemovedOnLoad : false,
                fields:fields,
                data : records
            }),
            listeners : {
                beforeedit : function(editor, e){

                    var store = this.getStore();
                    var selModel = this.getSelectionModel();
                    var selection = selModel.getSelection()[0];
                    var index = store.indexOf(selection) + 1;

                    if(index == store.getCount()){

                        store.insert(store.getCount(), [{}]);
                    }
                },
                edit : function(editor, e){
                    
                    if(e.originalValue != e.value){

                        this.isEdited = true;
                    }
                    this.getView().focus();
                }
            }
        });

        return this.grid;
    },

    initTablePropertiesTab : function(){

        return {
            xtype : 'panel',
            title : 'Table Properties'
        }
    },

    initTableIndexexTab : function(){

        return {
            xtype : 'panel',
            title : 'Table Indexes'
        }
    },

    initTableSQLTab : function(){

        return {
            xtype : 'panel',
            title : 'Table SQL'
        }
    },

    initTableInfoTab : function(){

        return {
            xtype : 'panel',
            title : 'Table Information'
        }
    },

    initCreateTable : function(){

        var store = this.grid.getStore();
        var records = [];
        for(var i = 0 ; i < 10 ; i++) {

            records.push({});
        }
        store.insert(0, records);
    },

    initAlterTable : function(){

        var store = this.grid.getStore();
        store.insert(store.getCount(), [{}]);
    },

    makeListColumns : function(){   

        return [
            { text: 'Field Name', dataIndex: 'field', width : 120, editor: {
                xtype: 'textfield'
            }},
            { text: 'Datatype', dataIndex: 'type' ,  width : 120, editor: {
                xtype: 'combobox',
                scope : this,
                store : Ext.Function.bind(function(){

                    return this.getApplication().getAPIS().getDataTypesToJSON();
                }, this)()
            }},
            { text: 'Length', dataIndex: 'len', width : 60, editor: {
                xtype: 'textfield'
            }},
            { text: 'Default', dataIndex: 'default', width : 100, editor: {
                xtype: 'textfield'
            }},
            { text: 'PK', xtype: 'checkcolumn', dataIndex: 'pk', width : 60 },
            { text: 'Not Null', xtype: 'checkcolumn', dataIndex: 'not_null', width : 60 },
            { text: 'Unsigned', xtype: 'checkcolumn', dataIndex: 'unsigned', width : 60 },
            { text: 'Auto Incr', xtype: 'checkcolumn', dataIndex: 'auto_incr', width : 60 },
            { text: 'Zerofill', xtype: 'checkcolumn', dataIndex: 'zerofill', width : 60 },
            { text: 'Comment', dataIndex: 'comment', flex: 1, editor: {
                xtype: 'textfield'
            }}
        ];
    },

    create : function(btn){

        var textfield = btn.up('window').down('textfield');
        var table = textfield.getValue();
        if(!table) {

            textfield.validate();
            return;
        }

        var node = this.getApplication().getSelectedNode(),
            db   = this.getApplication().getParentNode(node),
            query = 'CREATE TABLE `'+db+'`.`'+table+'`(',
            primaries = [], fields = [],
            store = this.grid.getStore();
            
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

        this.getApplication().tunneling({
            db : db,
            query : query,
            success : function(config, response){

                var tablesNode = this.getApplication().getParentNode(node , 2, true);
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

        var textfield = btn.up('window').down('textfield');
        var table = textfield.getValue();
        if(!table) {

            return;
        }

        var store = this.grid.getStore();
        
        var node = this.getApplication().getSelectedNode();
        var db   = this.getApplication().getParentNode(node);

        var query = 'ALTER TABLE `'+db+'`.`'+table+'`';
        var add_primaries = [];
        var del_primaries = [];
        var primaries = [];
        var fields = [];
        
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

    insertRow : function(btn){

        var store = this.grid.getStore();
        var selModel = this.grid.getSelectionModel();
        var selection = selModel.getSelection()[0];

        if(selection){

            var index = store.indexOf(selection);
            store.insert(index, [{}]);
        }
        else {

            store.insert(store.getCount(), [{}]);
        }
    },

    deleteRow : function(btn){

        var store = this.grid.getStore();
        var selModel = this.grid.getSelectionModel();
        var selection = selModel.getSelection()[0];
       
        var cnt = store.getCount();
        if(!selection) return;
        if(cnt == 1) return;
        if(selModel.getCurrentPosition().row == 0) selModel.move('down');
        else selModel.move('up');
        store.remove(selection);
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