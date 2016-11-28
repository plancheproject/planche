Ext.define('Planche.controller.layout.TableDataTab', {
    extend: 'Ext.app.Controller',
    prevNode : null,
    init : function () {

        var app = this.getApplication();

        this.control({
            'table-data-tab'   : {
                show: function() {

                    var node = app.getSelectedNode(true);

                    if(!app.getParentNode(node, 'table')){

                        return;
                    }

                    if(this.prevNode == node){

                        return;
                    }

                    this.prevNode = node;

                    var db = app.getSelectedDatabase(),
                        table = app.getSelectedNode();

                    if(app.openMode == 'select'){

                        app.openTable(db, table);
                    }
                    else {

                        app.countTable(db, table);
                    }
                }
            }
        });
    }
});