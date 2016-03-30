var Planche = Planche || {};
Planche.config = {
    hosts                   : [{
        hostName      : 'Allocation - PeopleCar',
        tunnelingURL  : 'http://localhost:8888',
        requestType   : 'ajax',
        host          : '211.111.164.230',
        user          : 'peoplecar',
        pass          : '123qwe.',
        charset       : 'utf8',
        port          : 3306,
        dbms          : 'mysql',
        autoConnection: false
    }, {
        hostName      : 'My Server - Root',
        tunnelingURL  : 'http://extjs.makewebapp.net/planche_tnl.php',
        requestType   : 'ajax',
        host          : 'localhost',
        user          : 'root',
        pass          : 'wjdwndnjs7142',
        charset       : 'utf8',
        port          : 3306,
        dbms          : 'mysql',
        autoConnection: false
    }, {
        hostName    : 'My Server - hanalabs',
        tunnelingURL: 'http://extjs.makewebapp.net/planche_tnl.php',
        requestType : 'jsonp',
        host        : 'localhost',
        user        : 'hanalabs',
        pass        : 'wjdwndnjs7142',
        charset     : 'utf8',
        port        : 3306
    }, {
        hostName    : 'My Server - 로컬터널링',
        tunnelingURL: 'http://localhost:8888',
        requestType : 'jsonp',
        host        : 'extjs.makewebapp.net',
        user        : 'planche',
        pass        : 'thdbsdltkfkd7142',
        charset     : 'utf8',
        port        : 3306,
        dbms        : 'mysql'
    }, {
        hostName    : 'My Server - Planche.io',
        tunnelingURL: 'http://localhost:8888',
        requestType : 'jsonp',
        host        : '128.199.81.3',
        user        : 'planche',
        pass        : 'thdbsdltkfkd7142',
        charset     : 'utf8',
        port        : 3306,
        dbms        : 'mysql'
    }, {
        hostName    : 'My Server - Planche Demo',
        tunnelingURL: 'http://www.makewebapp.net/planche-master/resources/tunneling/php/planche.php',
        requestType : 'jsonp',
        host        : 'localhost',
        user        : 'planche_demo',
        pass        : 'planche_demo',
        charset     : 'utf8',
        port        : 3306,
        dbms        : 'mysql'
    }, {
        hostName    : 'JDBSee Manager 68번',
        tunnelingURL: 'http://211.170.163.68/planche_tnl.php',
        requestType : 'jsonp',
        host        : 'localhost',
        user        : 'root',
        pass        : 'iruen',
        charset     : 'utf8',
        port        : 3306,
        dbms        : 'mysql'
    }, {
        hostName    : 'My Local - Ohcar',
        tunnelingURL: 'http://localhost:8888',
        requestType : 'jsonp',
        host        : '192.168.10.10',
        user        : 'homestead',
        pass        : 'secret',
        charset     : 'utf8',
        port        : 3306,
        dbms        : 'mysql'
    }, {
        hostName    : 'My Local - Ohcar',
        tunnelingURL: 'http://localhost:8888',
        requestType : 'jsonp',
        host        : '192.168.10.10',
        user        : 'homestead',
        pass        : 'secret',
        charset     : 'utf8',
        port        : 3306,
        dbms        : 'mysql'
    }, {
        hostName    : 'My Local - Ohcar',
        tunnelingURL: 'http://192.168.2.132:8888',
        requestType : 'jsonp',
        host        : 'localhost',
        user        : 'root',
        pass        : 'root',
        charset     : 'utf8',
        port        : 3306,
        dbms        : 'mysql'
    }],
    withoutIndexing         : [
        'information_schema',
        'performance_schema',
        'mysql'
    ],
    autoLoadConnectionWindow: true
};
