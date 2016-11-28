Ext.define('Planche.controller.table.TablePropertiesTab', {
    extend: 'Ext.app.Controller',
    views : [
        'Planche.view.table.TablePropertiesTab'
    ],
    init  : function() {

        var app = this.getApplication(),
            loadedCollation = false,
            loadedCharset = false;

        this.control({
            'table-properties-tab'        : {
                boxready: this.initTab
            },
            '#table-properties-btn-create': {
                click: function(btn) {

                    var ctrl = app.getController('table.TableSchemaTab');
                    ctrl[btn.getText().toLowerCase()](btn);
                }
            },
            '#properties-collation'       : {
                focus: function(combo) {

                    if (loadedCollation) {

                        return;
                    }

                    var tab = Ext.getCmp('table-properties-tab'),
                        db = tab.getDatabase(),
                        table = tab.getTable();

                    app.tunneling({
                        db     : db,
                        query  : app.getAPIS().getQuery('SHOW_COLLATION', db, table),
                        success: function(config, response) {

                            var tmp = [];
                            Ext.Array.each(response.records, function(row, idx) {

                                tmp.push({
                                    id  : row[0],
                                    text: row[0]
                                });
                            });

                            combo.store.loadData(tmp);

                            loadedCollation = true;
                        }
                    });
                }
            },
            '#properties-charset'         : {
                focus: function(combo) {

                    if (loadedCharset) {

                        return;
                    }


                    var tab = Ext.getCmp('table-properties-tab'),
                        db = tab.getDatabase(),
                        table = tab.getTable();

                    app.tunneling({
                        db     : db,
                        query  : app.getAPIS().getQuery('SHOW_CHARSET', db, table),
                        success: function(config, response) {

                            var tmp = [];
                            Ext.Array.each(response.records, function(row, idx) {

                                tmp.push({
                                    id  : row[0],
                                    text: row[0]
                                });
                            });

                            combo.store.loadData(tmp);

                            loadedCharset = true;
                        }
                    });
                }
            }

        });
    },

    initTab: function(tab) {

        var app = this.getApplication(),
            db = tab.getDatabase(),
            table = tab.getTable();

        if (!table) {

            return;
        }

        var bindData,
            tunnelings = [{
                db     : db,
                query  : app.getAPIS().getQuery('SHOW_CREATE_TABLE', db, table),
                success: function(config, response) {

                    var def = response.records[0][1],
                        getPropertie = function(field) {

                            var regexp = new RegExp(field + '=([a-zA-Z0-9_]+)', 'i'),
                                result = def.match(regexp);

                            if (!result) {

                                return null;
                            }

                            return result[1];
                        };

                    bindData = {
                        'properties-table-type'     : getPropertie('ENGINE'),
                        'properties-charset'        : getPropertie('CHARSET'),
                        'properties-checksum'       : getPropertie('CHECKSUM'),
                        'properties-delay-key-write': getPropertie('DELAY_KEY_WRITE'),
                        'properties-row-format'     : getPropertie('ROW_FORMAT'),
                        'properties-auto-incr'      : getPropertie('AUTO_INCREMENT'),
                        'properties-avg-row-len'    : getPropertie('AVG_ROW_LENGTH'),
                        'properties-minimum-row'    : getPropertie('MIN_ROWS'),
                        'properties-maximum-row'    : getPropertie('MAX_ROWS')
                    };
                }
            }, {
                db     : db,
                query  : app.getAPIS().getQuery('SHOW_TABLE_STATUS', db, table),
                success: function(config, response) {

                    var data = Planche.DBUtil.getAssocArray(response.fields, response.records)[0];

                    if (data.Create_options) {

                        var arr = data.Create_options.split(" ");
                        Ext.Array.each(arr, function(row) {

                            row = row.split("=");
                            data[row[0]] = row[1];
                        });
                    }

                    Ext.applyIf(bindData, {
                        'properties-table-type'     : data.Engine,
                        'properties-charset'        : data.Charset,
                        'properties-collation'      : data.Collation,
                        'properties-checksum'       : data.checksum,
                        'properties-delay-key-write': data.delay_key_write,
                        'properties-row-format'     : data.row_format,
                        'properties-auto-incr'      : data.Auto_increment,
                        'properties-avg-row-len'    : data.avg_row_length,
                        'properties-minimum-row'    : data.min_rows,
                        'properties-maximum-row'    : data.max_rows,
                        'properties-comment'        : data.Comment
                    });
                }
            }];

        app.tunnelings(tunnelings, {
            success: function() {

                var form = Ext.getCmp('properties-form');
                form.getForm().setValues(bindData);
                tab.setProperties(bindData);
            }
        });
    },

    getTableProperties: function() {

        var form = Ext.getCmp('properties-form');

        if (!form) {

            return '';
        }

        var tab = Ext.getCmp('table-properties-tab'),
            oldVals = tab.getProperties(),
            newVals = form.getValues(),
            properties = [],
            getNewValue = function(key) {

                if (newVals[key] === '') {

                    return null;
                }

                if (newVals[key] == oldVals[key]) {

                    return null;
                }

                return newVals[key];
            };

        var create_options = [],
            newVal = null;

        newVal = getNewValue('properties-table-type');
        if (newVal != null) {

            properties.push('ENGINE=' + newVal);
        }

        newVal = getNewValue('properties-charset');
        if (newVal != null) {

            properties.push('CHARSET=' + newVal);
        }

        newVal = getNewValue('properties-collation');
        if (newVal != null) {

            properties.push('COLLATE=' + newVal);
        }

        newVal = getNewValue('properties-checksum');
        if (newVal != null) {

            properties.push('CHECKSUM=' + newVal);
        }

        newVal = getNewValue('properties-avg-row-len');
        if (newVal != null) {

            properties.push('AVG_ROW_LENGTH=' + newVal);
        }

        newVal = getNewValue('properties-auto-incr');
        if (newVal != null) {

            properties.push('AUTO_INCREMENT=' + newVal);
        }

        newVal = getNewValue('properties-comment');
        if (newVal != null) {

            properties.push('COMMENT=\'' + newVal + '\'');
        }

        newVal = getNewValue('properties-delay-key-write');
        if (newVal != null) {

            properties.push('DELAY_KEY_WRITE=' + newVal);
        }

        newVal = getNewValue('properties-row-format');
        if (newVal != null) {

            properties.push('ROW_FORMAT=' + newVal);
        }

        newVal = getNewValue('properties-minimum-row');
        if (newVal != null) {

            properties.push('MIN_ROWS=' + newVal);
        }

        newVal = getNewValue('properties-maximum-row');
        if (newVal != null) {

            properties.push('MAX_ROWS=' + newVal);
        }

        if (create_options.length > 0) {

            properties.push('CREATE_OPTIONS=\'' + create_options.join(" ") + '\'');
        }

        return properties.join(' ');
    },

    syncProperties: function() {

        var form = Ext.getCmp('properties-form');

        if (!form) {

            return '';
        }

        var tab = Ext.getCmp('table-properties-tab');

        newVals = form.getValues();

        tab.setProperties(newVals);
    }
});
