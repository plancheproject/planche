Ext.define('Planche.controller.layout.HistoryTab', {
    extend: 'Ext.app.Controller',
    init : function () {

    	this.control({
    		'history-tab' : {
				boxready : function (editor, width, height) {

		            textarea = editor.getEl().query('textarea')[0];

		            Ext.apply(editor, {
		            	editor : CodeMirror.fromTextArea(textarea, {
		                    mode: 'text/x-mysql',
		                    indentWithTabs: true,
		                    smartIndent: true,
		                    matchBrackets : true,
		                    autofocus: true,
		                    readOnly : true,
		                    lineNumbers : false,
		                    showCursorWhenSelecting : false
		                }),
		            	getEditor : function () {
		            		return this.editor;
		            	}
		            });

					var task = new Ext.util.DelayedTask(function () {

					    editor.getEditor().setValue(this.application.history.join("\n"));

					}, this);

					task.delay(100);
				},
				resize : function (editor, width, height) {

					editor.getEditor().setSize(width, height);
				},
				activate : function (editor) {

					try{

						if(editor.getEditor()) {

							editor.getEditor().setValue(this.application.history.join("\n"));
						}
					}
					catch(e) {

					}

				}
    		}
    	})
    }
});