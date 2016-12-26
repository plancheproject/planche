'use strict';
var through = require("through");
var tsort = require("./tsort");
var fs = require('fs');

module.exports = function (options) {

	var depTemp = [];
	return through(function(file) {

		var fileContent = file.contents.toString();
		var config = JSON.parse(fileContent);

		var includes = {
			requires : filterPlatform(config.requires, options.Platform),
			stores : filterPlatform(config.stores, options.Platform),
			views : filterPlatform(config.views, options.Platform),
			controllers : filterPlatform(config.controllers, options.Platform)
		};

		var tplPath = options.source + '/Application.tpl';
		var outputPath = options.source + '/Application.js';
		var js = fs.readFileSync(tplPath).toString();
		js = removeSpaces(removeComments(js));

		js = js.replace("controllers:[]", "controllers:" + JSON.stringify(includes.controllers));
		js = js.replace("views:[]", "views:" + JSON.stringify(includes.views));
		js = js.replace("stores:[]", "stores:" + JSON.stringify(includes.stores));
		js = js.replace("requires:[]", "requires:" + JSON.stringify(includes.requires));

		fs.writeFileSync(outputPath, js);

		depTemp.push([ 'Planche.Application' , 'Planche.App' ]);

		depTemp = depTemp.concat(
			orderDependencies(includes.controllers, 'controllers'),
			orderDependencies(includes.views, 'views'),
			orderDependencies(includes.stores, 'stores'),
			orderDependencies(includes.requires, 'requires')
		);

	}, function() {

		var list = tsort(depTemp);
		var text = '';

		list.forEach(function(className){

			if(className.indexOf('Planche') > -1){

				var file = className.slice('Planche'.length + 1).replace(/\./g, '/')
				text += 'require("./' + file + '");\n';
			}
		})

		fs.writeFileSync('src/entry.js', text);
		//
		// wstream.write('require("./app")\n');

	});

	function filterPlatform(includes, Platform){

		var filtered = [];
		includes.forEach(function(className){

			var tmp = className.split(".")
			var word = tmp.pop();

			if(word == "Planche-Wordpress" || word == "Planche-Desktop" || word == "Planche" || word == "Planche-Chrome"){

				if(Platform == word){

					filtered.push(className);
					return;
				}
			}
			else {

				filtered.push(className);
			}
		});

		return filtered;
	}

	function getDefinedClassName(content){

		return content.match(/Ext.define\([\'|\"]([a-zA-Z0-9\.\-]*?)[\'|\"]/)[1]
	}

	function orderDependencies(includes, type){

		var temp = [];
		includes.forEach(function(className){

			var contents = '';

			if(className.indexOf('Planche') > -1){

				var file = className.slice('Planche'.length + 1).replace(/\./g, '/')
				var path = './' + options.source + '/' +  file + '.js';

				contents = fs.readFileSync(path).toString();
				contents = removeSpaces(removeComments(contents));
			}

			var dependencies = [].concat(
				getDependencies('requires', contents),
				getDependencies('extend', contents),
				getDependencies('mixins', contents),
				getDependencies('model', contents),
				getDependencies('stores', contents),
				getDependencies('controllers', contents),
				getDependencies('views', contents)
			)

			if(dependencies.length === 0){

				temp.push([ className, 'Planche.Application' ])
			}
			else {

				dependencies.forEach(function(dependency){

					temp.push([ dependency, className ])
				})
			}
		})

		return temp;
	}

	function getDependencies(type, content){

		var pattern = '[\"\']?' + type + '[\"\']?:\\\[([a-zA-Z0-9\'\"\.,\\\-_]+)\\\]';
		var regexp = new RegExp(pattern, '')
		var matches = content.match(regexp)

		if(matches !== null && matches.length > 0){

			matches = matches[1].match(/Planche\.[a-zA-Z0-9\.\\\-_]+/g)

			if(matches !== null && matches.length > 0){

				return matches
			}
		}
		else {

			var pattern = '[\"\']?' + type + '[\"\']?:[\'\"]([a-zA-Z0-9.\\\-_]+)[\'\"]';
			var regexp = new RegExp(pattern, '')
			var matches = content.match(regexp)

			if(matches !== null && matches.length > 0){

				return [ matches[1] ]
			}
		}

		return [];
	}

	//noinspection Eslint
	function removeComments(content) {

		return content.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '');
	}

	function removeSpaces(content) {

		return content.replace(/[\s\r\n]+/gm, '');
	}

	function isExtJSFile(content){

		return content.search(/Ext\.define/g) > -1;
	}
};
