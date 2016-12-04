// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var Datastore = require('nedb');
Planche.tunneling = require(__dirname + '/tunneling/tunneling');
Planche.db = new Datastore({ filename: __dirname + '/data/config.db' });
Planche.db.loadDatabase(function(){

    Planche.db.find({}, function (err, docs) {

        if(!docs || docs.length == 0){

            var config = {
                hosts : [],
                noIndexing : [
                    'information_schema',
                    'performance_schema',
                    'mysql'
                ],
                autoLoadConnectionWindow: true
            };

            Planche.db.insert(config, function (err, newDoc) {

                Planche.config = config;
            });
        }
        else {

            Planche.config = docs;
        }
    });
});
