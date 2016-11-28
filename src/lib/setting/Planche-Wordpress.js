Ext.define('Planche.lib.setting.Planche-Wordpress', {
    singleton         : true,
    alternateClassName: ['Planche.lib.Setting'],

    setHosts : function(hosts, callback) {

        Ext.Ajax.request({
            url: 'config/hosts.php',
            method : 'post',
            params: {
                hosts : Ext.JSON.encode(hosts)
            },
            success: function(response){

                // debugger;
                if (response.responseText) {

                    response = Ext.JSON.decode(response.responseText);
                }

                if (response.success === true) {

                    if(callback){ callback(); }
                }
                else {

                    Ext.Msg.alert('error', response.message);
                }
                // process server response here
            },
            failure : function(response){

                Ext.Msg.alert('error', 'Please. Try again.');
            }
        });
    },

    getHosts: function(callback) {

        Ext.Ajax.request({
            url: 'config/hosts.php',
            method : 'get',
            params : {
                'ajax' : true
            },
            success: function(response){

                // debugger;
                if (response.responseText) {

                    response = Ext.JSON.decode(response.responseText);
                }

                if (response.success === true) {

                    if(callback){ callback(response.hosts); }
                }
                else {

                    Ext.Msg.alert('error', response.message);
                }
                // process server response here
            },
            failure : function(response){

                Ext.Msg.alert('error', 'Please. Try again.');
            }
        });
    },

    isEnableAutoLoadConnectionWindow : function(callback){

        Ext.Ajax.request({
            url: 'config/hosts.php',
            method : 'get',
            params : {
                'ajax' : true
            },
            success: function(response){

                // debugger;
                if (response.responseText) {

                    response = Ext.JSON.decode(response.responseText);
                }

                if (response.success === true) {

                    if(callback){ callback(response.autoLoadConnectionWindow); }
                }
                else {

                    Ext.Msg.alert('error', response.message);
                }
                // process server response here
            },
            failure : function(response){

                Ext.Msg.alert('error', 'Please. Try again.');
            }
        });
    }
});
