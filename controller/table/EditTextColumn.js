Ext.define('Planche.controller.EditTextColumn', {
    extend: 'Ext.app.Controller',

    initWindow : function(content){

        Ext.create('Lib.window', {
            stateful: true,
            title : 'Text Editor',
            layout : 'fit',
            bodyStyle:"background-color:#FFFFFF",
            width : 500,
            height: 400,
            overflowY: 'auto',
            autoScroll : true,
            modal : true,
            plain: true,
            fixed : true,
            shadow : false,
            autoShow : true,
            constrain : true,
            items : [{
                xtype : 'textareafield',
                value : this.htmlspecialchars_decode(content)
            }],
            buttons : [{
                text : 'Up',
                scope : this
            },{
                text : 'Down',
                scope : this
            },{
                text : 'Save',
                scope : this
            },{
                text : 'Close',
                scope : this
            }],
            listeners: {
                scope : this,
                boxready : function(){

                    
                }
            }
        });
    },

    htmlspecialchars_decode : function(string, quote_style) {

      var optTemp = 0,
        i = 0,
        noquotes = false;
      if (typeof quote_style === 'undefined') {
        quote_style = 2;
      }
      string = string.toString()
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
      };
      if (quote_style === 0) {
        noquotes = true;
      }
      if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i = 0; i < quote_style.length; i++) {
          // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
          if (OPTS[quote_style[i]] === 0) {
            noquotes = true;
          } else if (OPTS[quote_style[i]]) {
            optTemp = optTemp | OPTS[quote_style[i]];
          }
        }
        quote_style = optTemp;
      }
      if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
        // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
      }
      if (!noquotes) {
        string = string.replace(/&quot;/g, '"');
      }
      // Put this in last place to avoid escape being double-decoded
      string = string.replace(/&amp;/g, '&');

      return string;
    }
});