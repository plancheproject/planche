Ext.define('Planche.lib.setting.Planche-Chrome', {
    singleton         : true,
    alternateClassName: ['Planche.lib.Setting'],

    constructor: function (config) {

        this.callSuper(arguments);
    },

    setHosts : function(hosts, callback) {

        chrome.storage.sync.set({ hosts : hosts }, function(){

            if(callback){ callback(); }
        });
    },

    getHosts: function(callback) {

        var hosts   = [];

        chrome.storage.sync.get('hosts', function(config){

            var savedLocalHosts = config.hosts;

            Ext.Array.each(savedLocalHosts, function(connInfo, index) {

                Ext.apply(connInfo, {
                    'into' : 'localstorage',
                    'index': index
                });

                hosts.push(connInfo);
            });

            if(callback) callback(hosts)
        });
    },

    isEnableAutoLoadConnectionWindow : function(callback){

        chrome.storage.sync.get('autoLoadConnectionWindow', function(config){

            if(callback){ callback(config.autoLoadConnectionWindow); }
        });
    }
});
