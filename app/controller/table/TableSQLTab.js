Ext.define('Planche.controller.table.TableSQLTab', {
    extend: 'Ext.app.Controller',
    views : [
        'table.TableInfoTab'
    ],
    init : function () {
        
        this.control({
            'table-sql-tab' : {
            }
        });
    }
});