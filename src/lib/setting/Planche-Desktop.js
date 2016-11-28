Ext.define('Planche.lib.setting.Planche-Desktop', {
    singleton         : true,
    alternateClassName: ['Planche.lib.Setting'],
    setHosts : function(hosts, callback) {

        localStorage.setItem('planche-hosts', Ext.JSON.encode(hosts));

        if(callback){ callback(); }
    },

    getHosts: function(callback) {

        var hosts   = [],
            hostIdx = 0;

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
                    'index': index
                });

                hosts.push(connInfo);
            });
        }

        if(callback) callback(hosts)
    }
});
