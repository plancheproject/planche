Ext.define('Planche.controller.layout.MessageTab', {
    extend: 'Ext.app.Controller',
    init : function () {

    	this.control({
    		'message-tab' : {
	    		'openMessage' : this.openMessage
	    	}
	    });
    },

   	openMessage : function (messages) {

        var 
		app		= this.getApplication(),
		panel	= app.getActiveMessageTab(),
		dom		= Ext.get(panel.getEl().query("div[id$=innerCt]"));

        if(typeof messages == 'object') {

        	var message = '';
        	Ext.Array.each(messages, function (str, idx) {

        		message += str+"<br/><br/>";
        	});
        	
        	dom.setHTML(message);
        }
        else {

        	dom.setHTML(messages);
        }
        
        panel.show();
	}
});