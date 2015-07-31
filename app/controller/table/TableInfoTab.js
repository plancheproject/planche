Ext.define('Planche.controller.table.TableInfoTab', {
    extend: 'Ext.app.Controller',
    views : [
        'table.TableInfoTab'
    ],
    init  : function() {

        this.control({
            'table-info-tab': {
                boxready: function(tab) {

                    Planche.SchemaUtil.exportTableInfoToHTML(tab, 'update');
                }
            }
        });
    }
});