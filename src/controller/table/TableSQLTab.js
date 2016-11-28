Ext.define('Planche.controller.table.TableSQLTab', {
    extend: 'Ext.app.Controller',
    views : [
        'Planche.view.table.TableInfoTab'
    ],
    init  : function() {

        this.control({
            'table-sql-tab': {
                boxready: this.initTab,
                resize  : this.resizeTab
            }
        });
    },

    resizeTab: function(tab, width, height) {

        tab.getEditor().setSize(width, height);
    },

    initTab: function(tab, width, height) {

        var app = this.getApplication(),
            db = tab.getDatabase(),
            table = tab.getTable(),
            query = app.getAPIS().getQuery('TABLE_CREATE_INFO', db, table),
            textarea = tab.getEl().query('textarea')[0];

        Ext.apply(tab, {
            editor   : CodeMirror.fromTextArea(textarea, {
                mode          : 'text/x-mysql',
                indentWithTabs: true,
                smartIndent   : true,
                lineNumbers   : true,
                matchBrackets : true,
                autofocus     : true
            }),
            getEditor: function() {

                return this.editor;
            }
        });

        tab.setLoading(true);

        app.tunneling({
            db     : db,
            query  : query,
            success: function(config, response) {

                tab.getEditor().setValue(response.records[0][1]);
                tab.setLoading(false);
            },
            failure: function(config, response) {

                tab.setLoading(false);
            }
        });
    }
});
