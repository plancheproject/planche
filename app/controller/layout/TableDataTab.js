Ext.define('Planche.controller.layout.TableDataTab', {
    extend: 'Ext.app.Controller',
    prevNode : null,
    init : function () {

        var app = this.getApplication();

        this.control({
            'table-data-tab'   : {
                show: function() {

                    var node = app.getSelectedNode();

                    if(!app.getParentNode(node, 'table')){

                        return;
                    }

                    if(this.prevNode == node){

                        return;
                    }

                    this.prevNode = node;

                    if(app.openMode == 'select'){

                        app.openTable(node);
                    }
                    else {

                        app.countTable(node);
                    }
                }
            }
        });
    }
});