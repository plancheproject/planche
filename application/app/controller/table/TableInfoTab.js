Ext.define('Planche.controller.table.TableInfoTab', {
    extend: 'Ext.app.Controller',
    views : [
        'table.TableInfoTab'
    ],
    init  : function() {

        this.control({
            'table-info-tab': {
                boxready: function(tab) {

                    var db = tab.getDatabase(),
                        table = tab.getTable();

                    Planche.SchemaUtil.exportTableInfoToHTML(db, table, tab, 'update');
                }
            }
        });
    }
});