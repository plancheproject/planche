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
            http_tunneling : 'http://example.com/planche_tnl.php',
            host    : 'localhost',
            user    : 'user',
            pass    : 'password',
            charset : 'utf8',
            port    : 3306
        }
    ]    
}

