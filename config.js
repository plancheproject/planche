var Planche = Planche || {};
Planche.config = {
    hosts : [
        {
            host_name : 'Local Example', 
            http_tunneling : 'http://192.168.0.20/tunnel.php',
            host    : 'localhost',
            user    : 'root',
            pass    : 'password',
            charset : 'utf8',
            port    : 3306
        },
        {
            host_name : 'DB Server 2', 
            http_tunneling : 'http://extjs.makewebapp.net/webql/planche_tnl.php',
            host    : 'localhost',
            user    : 'websql',
            pass    : 'mvp2002',
            charset : 'utf8',
            port    : 3306
        }
    ]    
}

