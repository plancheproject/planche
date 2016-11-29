var http        = require('http'),
    url         = require('url'),
    querystring = require('querystring'),
    tunneling   = tunneling || require('./tunneling');

var args = process.argv.slice(2);
var options = {};
for(var i in args) {

  var tmp = args[i].split("=");
  options[tmp[0].slice(2)] = tmp[1];
}

var DEBUG   = true,
    addr    = options.addr || '127.0.0.1',
    port    = options.port || 8888,
    cmd     = options.cmd || null,
    mode    = options.mode || 'http';

if(mode == 'cli'){

  tunneling({
    cmd : cmd
  });
}
else if(mode == 'http'){

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
}
