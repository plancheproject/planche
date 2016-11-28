var http        = require('http'),
    url         = require('url'),
    querystring = require('querystring'),
    tunneling   = tunneling || require('./tunneling');

var DEBUG   = true,
    addr    = process.argv[2] ? process.argv[2] : '127.0.0.1',
    port    = process.argv[3] ? process.argv[3] : 8888;

console.log("-----------------------------------------------------------------------");
console.log("Start Planche Tunneling Server");
console.log("Mapping http://" + addr + ":" + port + "/ to ....");
console.log("-----------------------------------------------------------------------");
console.log("HTTP tunneling server is ready at : http://" + addr + ":" + port);
console.log("-----------------------------------------------------------------------");

//Create Webserver
http.createServer(function(request, response) {

    if (request.url == '/favicon.ico') {

        response.end('\n');
        return;
    }

    if (request.method == 'GET') {

        var parse  = url.parse(request.url),
            params = querystring.parse(parse.query);

        tunneling(params, response);
        return;
    }

    var body = '';
    request.on('data', function(data) {

        body += data;
    });

    request.on('end', function() {

        var params = querystring.parse(body);
        tunneling(params, response);
    });

}).listen(port, addr);
