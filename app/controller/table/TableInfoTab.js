Ext.define('Planche.controller.table.TableInfoTab', {
    extend: 'Ext.app.Controller',
    views : [
        'table.TableInfoTab'
    ],
    init : function () {
        
        this.control({
            'table-info-tab' : {
                boxready : this.initTab
            }
        });
    },

    initTab : function(tab, width, height){

        var app     = this.getApplication(),
            node    = app.getSelectedNode(),
            db      = app.getParentNode(node),
            tb      = node.data.text,
            api     = app.getAPIS(),
            me      = this,
            el      = tab.getEl(),
            dom     = Ext.get(el.query("div[id$=innerCt]")),
            queries = [
                api.getQuery('SHOW_FULL_FIELDS', db, tb),
                api.getQuery('TABLE_KEYS_INFO', db, tb)
            ];

        tab.setLoading(true);

        app.multipleTunneling(db, queries, {
            failureQuery   : function (idx, query, config, response) {

                messages.push(app.generateError(query, response.message));

                tab.setLoading(false);
            },
            afterAllQueries : function (queries, results) {

                var html = [];
                html.push('<h3>Show Table Fields</h3>');                    
                me.makeTableByRecord(results[0].response, html);
                html.push('<h3>Show Table Indexes</h3>');                   
                me.makeTableByRecord(results[1].response, html);
                dom.setHTML(html.join(""));

                tab.setLoading(false);
            }
        });
    },

    makeTableByRecord : function (record, html) {

        var html = html || [];
        html.push('<table class="info" width="100%">');
        html.push('<tr>');
        Ext.Array.each(record.fields, function (col, cidx) {

            html.push('<th>'+col.name+'</th>');
        });
        html.push('</tr>');
        Ext.Array.each(record.records, function (row, ridx) {

            html.push('<tr>');
            Ext.Array.each(record.fields, function (col, cidx) {

                html.push('<td>'+row[cidx]+'</td>');
            });
            html.push('</tr>');
        });
        html.push('</table>');
        return html;
    }
});