var express = require('express'),
    tunneling = tunneling || require('./tunneling');

var args = process.argv.slice(2);
var options = {};
for (var i in args) {

    var tmp = args[i].split("=");
    options[tmp[0].slice(2)] = tmp[1];
}

var DEBUG = true,
    addr = options.addr || '127.0.0.1',
    port = options.port || 8888,
    cmd = options.cmd || null,
    mode = options.mode || 'http';

var app = express();

app.get('/', function (req, res) {

  var _response_end = function () {

      res.end('\n');
  }

  var params = {
    cmd : req.query.cmd,
    callback : req.query.callback,
    mode : 'http'
  };

  tunneling(params, res).then(
      _response_end,
      _response_end
  );
});

app.listen(port, addr, function () {

  console.log(
      "-----------------------------------------------------------------------"
  );
  console.log("Start Planche Tunneling Server");
  console.log("Mapping http://" + addr + ":" + port + "/ to ....");
  console.log(
      "-----------------------------------------------------------------------"
  );
  console.log("HTTP tunneling server is ready at : http://" + addr + ":" + port);
  console.log(
      "-----------------------------------------------------------------------"
  );
});
