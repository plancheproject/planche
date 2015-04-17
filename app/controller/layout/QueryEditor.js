Ext.define('Planche.controller.layout.QueryEditor', {
    extend: 'Ext.app.Controller',
    init : function () {

    	this.control({
    		'query-editor' : {
				boxready : function (editor, width, height) {

		            textarea = editor.getEl().query('textarea')[0];

		            Ext.apply(editor, {
		            	editor : CodeMirror.fromTextArea(textarea, {
		                    mode: 'text/x-mysql',
		                    indentWithTabs: true,
		                    smartIndent: true,
		                    lineNumbers: true,
		                    matchBrackets : true,
		                    autofocus: true
		                }),
		            	getEditor : function () {

		            		return this.editor;
		            	}
		            });
				},
				resize : function (editor, width, height) {

					editor.getEditor().setSize(width, height);
				}
    		}
    	})
    }
});