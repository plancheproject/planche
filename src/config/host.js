var Planche = Planche || {};
Planche.config = {
    hosts                   : [{
        hostName    : 'My Host',
        tunnelingURL: 'http://localhost:8888',
        requestType : 'jsonp',
        host        : 'localhost',
        user        : 'user',
        pass        : 'password',
        charset     : 'utf8',
        port        : 3306,
        dbms        : 'mysql'
    }],
    noIndexing         : [
        'information_schema',
        'performance_schema',
        'mysql'
    ],
    autoLoadConnectionWindow: true
};
