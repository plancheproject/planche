Ext.define('Planche.lib.setting.Planche-Desktop', {
    singleton         : true,
    alternateClassName: ['Planche.lib.Setting'],

    constructor: function (config) {

        this.callSuper(arguments);
    },

    setHosts : function(hosts, callback) {

        Planche.db.findOne({}, function (err, config) {

            config.hosts = hosts;

            Planche.db.update({}, config, {}, function (err, numAffected) {

                if(callback){ callback(); }
            });
        });

    },

    getHosts: function(callback) {

        var hosts   = [];

        Planche.db.findOne({}, function (err, config) {

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

        Planche.db.findOne({}, function (err, config) {
            
            if(callback){ callback(config.autoLoadConnectionWindow); }
        });
    }
});
