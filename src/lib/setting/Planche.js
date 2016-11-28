Ext.define('Planche.lib.setting.Planche', {
    singleton         : true,
    alternateClassName: ['Planche.lib.Setting'],
    setHosts : function(hosts, callback) {

        var tmp = [];

        Ext.each(hosts, function(host) {

            if(host.into == 'hostfile') {

                return;
            }

            tmp.push(host);
        });

        localStorage.setItem('planche-hosts', Ext.JSON.encode(tmp));

        if(callback){ callback(); }
    },

    getHosts: function(callback) {

        var hosts   = [],
            hostIdx = 0;

        Ext.Array.each(Planche.config.hosts || [], function(connInfo, index) {

            Ext.apply(connInfo, {
                'into' : 'hostfile',
                'index': hostIdx
            });

            hosts.push(connInfo);

            hostIdx++;
        });

        if (typeof(Storage) !== "undefined") {

            try {

                var savedLocalHosts = JSON.parse(localStorage.getItem('planche-hosts'));
            }
            catch (e) {

                var savedLocalHosts = [];
            }

            Ext.Array.each(savedLocalHosts, function(connInfo, index) {

                Ext.apply(connInfo, {
                    'into' : 'localstorage',
                    'index': hostIdx
                });

                hosts.push(connInfo);

                hostIdx++;
            });
        }

        if(callback) callback(hosts)
    },

    isEnableAutoLoadConnectionWindow : function(callback){

        callback(Planche.config.autoLoadConnectionWindow)
    }
});
