Ext.define('Planche.controller.database.CreateDatabase', {
    extend    : 'Ext.app.Controller',
    initWindow: function(db) {

        this.isAlter = db ? true : false;
        this.loadData(db);
    },

    loadData: function(db) {

        var app = this.getApplication(),
            me = this,
            queries = [
                {key: 'collation', str: app.getAPIS().getQuery('SHOW_COLLATION')},
                {key: 'charset', str: app.getAPIS().getQuery('SHOW_CHARSET')},
                {key: 'collation_val', str: app.getAPIS().getQuery('COLLATION_DATABASE')},
                {key: 'charset_val', str: app.getAPIS().getQuery('CHARSET_DATABASE')}
            ],
            tunneling,
            messages = [];

        app.setLoading(true);

        me.comboData = {};
        me.comboValue = {};

        (tunneling = Ext.Function.bind(function() {

            var query = queries.shift();

            if (query) {

                app.tunneling({
                    db     : db,
                    query  : query.str,
                    success: function(config, response) {

                        if (query.key == 'collation' || query.key == 'charset') {

                            var tmp = [];
                            Ext.Array.each(response.records, function(row, idx) {

                                tmp.push({
                                    id  : row[0],
                                    text: row[0]
                                });
                            });

                            me.comboData[query.key] = tmp;
                        }
                        else {

                            me.comboValue[query.key] = response.records[0][1];
                        }

                        tunneling();
                    },
                    failure: function(config, response) {

                        messages.push(app.generateErrorMessage(query.str, response.message));

                        tunneling();
                    }
                })
            }
            else {

                app.getActiveConnectTab().setLoading(false);

                if (messages.length == 0) {

                    this.initCreateWindow(db);
                }
                else {

                    app.openMessage(messages);
                }
            }

        }, me))();
    },

    initCreateWindow: function(db) {

        Ext.create('Planche.lib.Window', {
            stateful   : true,
            title      : this.isAlter ? 'Alter database \'' + db + '\'' : 'Create new database',
            layout     : 'vbox',
            bodyStyle  : "background-color:#FFFFFF",
            width      : 300,
            height     : 200,
            bodyPadding: '10px 10px 10px 10px',
            overflowY  : 'auto',
            autoScroll : true,
            modal      : true,
            plain      : true,
            fixed      : true,
            shadow     : false,
            autoShow   : true,
            constrain  : true,
            items      : [
                this.initDatabaseName(db),
                this.initDatabaseCharSet(),
                this.initDatabaseCollation()
            ],
            buttons    : [{
                text   : this.isAlter ? 'Alter' : 'Create',
                scope  : this,
                handler: this.isAlter ? this.alter : this.create
            }, {
                text   : 'Cancel',
                scope  : this,
                handler: this.cancel
            }]
        });
    },

    initDatabaseName: function(database) {

        return {
            id        : 'database-name',
            xtype     : 'textfield',
            width     : '100%',
            allowBlank: false,
            emptyText : 'Enter new database name..',
            disabled  : this.isAlter,
            value     : this.isAlter ? database : ''
        };
    },

    initDatabaseCollation: function() {

        this.comboData.collation.unshift({
            id: '', text: 'Database Collation'
        });

        this.comboCollation = this.initComboBox(
            'database-collation',
            this.comboData.collation,
            this.comboValue.collation_val
        );

        return this.comboCollation;
    },

    initDatabaseCharSet: function() {

        this.comboData.charset.unshift({
            id: '', text: 'Database Charset'
        });

        this.comboCharset = this.initComboBox(
            'database-charset',
            this.comboData.charset,
            this.comboValue.charset_val
        );

        return this.comboCharset;
    },

    initComboBox: function(id, data, value) {

        var store = new Ext.data.Store({
                fields: ['id', 'text'],
                data  : data
            }),

            // Simple ComboBox using the data store
            combo = Ext.create('Ext.form.ComboBox', {
                width       : '100%',
                id          : id,
                emptyText   : 'default',
                value       : value,
                displayField: 'text',
                queryMode   : 'local',
                valueField  : 'id',
                labelWidth  : 80,
                editable    : true,
                store       : store,
                typeAhead   : true,
                anyMatch    : true
            });

        return combo;
    },

    create: function(btn) {

        var textfield = btn.up('window').down('textfield'),
            db = textfield.getValue(),
            app = this.getApplication(),
            node = app.getSelectedNode(true),
            collation = Ext.getCmp('database-collation').getValue(),
            charset = Ext.getCmp('database-charset').getValue();

        if (!db) {

            textfield.validate();
            return;
        }

        app.tunneling({
            query  : app.getAPIS().getQuery('CREATE_DATABASE', db, charset, collation),
            success: function(config, response) {

                var tree = app.getSelectedTree(),
                    rootNode = tree.getRootNode();

                app.reloadTree(rootNode);

                btn.up('window').destroy();

                app.fireEvent('after_create_database');
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
            }
        });
    },

    alter: function(btn) {

        var app = this.getApplication(),
            node = app.getSelectedNode(true),
            db = app.getParentNode(node),
            collation = Ext.getCmp('database-collation').getValue(),
            charset = Ext.getCmp('database-charset').getValue();

        app.tunneling({
            db     : db,
            query  : app.getAPIS().getQuery('ALTER_DATABASE', db, charset, collation),
            success: function(config, response) {

                var tree = app.getSelectedTree(),
                    rootNode = tree.getRootNode();

                app.reloadTree(rootNode);

                btn.up('window').destroy();

                app.fireEvent('after_alter_database');
            },
            failure: function(config, response) {

                Ext.Msg.alert('Error', response.message);
            }
        });
    },

    cancel: function(btn) {

        btn.up('window').destroy();
    }
});