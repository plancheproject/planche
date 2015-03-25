/*
This file is part of Planche 0.1

Contact: jjwcom@nate.com
*/
Ext.namespace('Planche');

//set up config path for your app
Ext.application({
	appFolder	: '.',
	name		: 'Planche',
	history     : [],
	launch		: function() {

        // setup the state provider, all state information will be saved to a cookie
        Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

		this.include([
			'Planche.lib.Window',
			'Planche.lib.Menu',
			'Planche.lib.QueryTokenType',
			'Planche.lib.Query',
			'Planche.lib.QueryParser',
			'Planche.lib.QueryAlignment'
		], this.initLayout, this);

        //stop backspace
        Ext.EventManager.addListener(Ext.getBody(), 'keydown', function(e){

            if(e.getTarget().type != 'text' && e.getKey() == '8' ){
                e.preventDefault();
            }
        });

        window.onbeforeunload = function(){

            var message = "Are you sure you want to quit planche?";
            return message;
        }
    },

    /**
     * include
     * 
     * 컨트롤러 초기화 메소드.
     * 
     * @access public
     *
     * @return 
     */
    include : function(includes, callback, scope){

		var loading;
		(loading = Ext.Function.bind(function(){

			var file = includes.shift();
			if(file) {

				 Ext.require(file, function(){

				 	loading();
				 }, this);
			}
			else {

		        Ext.Function.bind(callback, this)();
			}
		}, scope))();
    },



});