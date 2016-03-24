Ext.define('Planche.controller.menu.Help', {
    extend: 'Planche.lib.Menu',
    add   : function(topBtn) {

        var app = this.getApplication();

        topBtn.menu.add([{
            text   : 'About Planche',
            handler : function(){

                window.open('http://plancheproject.github.io/planche_for_wordpress/#about', 'about');
            }
        }, {
            text   : 'Planche issues',
            handler : function(){

                window.open('https://github.com/plancheproject/planche_for_wordpress/issues', 'issue');
            }
        }]);

        this.added = true;
    }
});
