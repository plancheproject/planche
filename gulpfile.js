var gulp = require('gulp');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');
var config = require('./package.json').planche;
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var path = require('path')
var runSequence = require('run-sequence');
var exec = require('child_process').exec;
var file = require('gulp-file');

var arguments = {
  platform: 'planche'
};

var args = process.argv.slice(2);
for (var i in args) {

  var tmp = args[i].split("=");
  arguments[tmp[0].slice(2)] = tmp[1];
}

var platform = arguments.platform;
var tmp = platform.split("-");
var Platform = '';

if (tmp.length > 1) {

  Platform = tmp[0][0].toUpperCase() + tmp[0].slice(1) + '-' + tmp[1][0].toUpperCase() + tmp[1].slice(1);
}
else {

  Platform = tmp[0][0].toUpperCase() + tmp[0].slice(1);
}

var PLATFORM = platform.toUpperCase();

var entry = require('./build_modules/gulp-planche-make-entry');

var getBuildTasks = function () {

  var tasks = [
    'build:make:entry',
    'build:webpack',
    'build:copy:index',
    'build:copy:package.json'
  ];

  if (platform == 'planche') {

    tasks.push(
      'build:copy:host',
      'build:copy:tunneling:node',
      'build:copy:tunneling:php'
    );
  }

  if (platform == 'planche-desktop') {

    tasks.push(
      'build:copy:electron',
      'build:copy:tunneling:node',
      'build:copy:tunneling:php'
    )
  }

  if (platform == 'planche-chrome') {

    tasks.push(
      'build:copy:chrome'
    )
  }

  return tasks;
};

gulp.task('build:make:entry', function () {
  gulp.src([
    config.src + '/Application.json'
  ])
    .pipe(entry({
      source: config.src,
      Platform: Platform
    }))
});

gulp.task('build:webpack', function () {

  return gulp.src(config.src + '/entry.js')
    .pipe(webpackStream({
      entry: path.resolve(__dirname, config.src) + "/entry.js",
      output: {
        path: path.resolve(__dirname, config.dist[platform]),
        filename: "app.bundle.js",
        sourceMapFilename: "[file].map"
      },
      // plugins: [new webpack.optimize.UglifyJsPlugin()],
      devtool: 'source-map'
    }))
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build:copy:resources', function () {

  return gulp.src([
    config.src + '/resources/css/**/*',
    config.src + '/resources/images/**/*',
    config.src + '/bower_components/extjs/resources/css/ext-all-gray.css',
    config.src + '/bower_components/extjs/resources/ext-theme-gray/ext-theme-gray-all.css',
    config.src + '/bower_components/extjs/resources/ext-theme-gray/images/**/*',
    config.src + '/bower_components/extjs/ext-all.js',
    config.src + '/bower_components/extjs/license.txt',
    config.src + '/bower_components/codemirror/addon/dialog/dialog.css',
    config.src + '/bower_components/codemirror/lib/codemirror.css',
    config.src + '/bower_components/codemirror/addon/search/matchesonscrollbar.css',
    config.src + '/bower_components/codemirror/lib/codemirror.js',
    config.src + '/bower_components/codemirror/addon/dialog/dialog.js',
    config.src + '/bower_components/codemirror/addon/search/searchcursor.js',
    config.src + '/bower_components/codemirror/addon/search/search.js',
    config.src + '/bower_components/codemirror/addon/scroll/annotatescrollbar.js',
    config.src + '/bower_components/codemirror/addon/search/matchesonscrollbar.js',
    config.src + '/bower_components/codemirror/mode/sql/sql.js',
    config.src + '/bower_components/codemirror/*.md',
    config.src + '/bower_components/codemirror/LICENSE',
    config.src + '/bower_components/async/dist/async.min.js',
    config.src + '/bower_components/async/dist/LICENSE'
  ], { base: config.src })
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build:copy:electron', function () {

  return gulp.src([
    config.src + '/electron/**/*'
  ])
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build:copy:chrome', function () {

  return gulp.src([
    config.src + '/chrome/**/*'
  ])
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build:copy:wordpress', function () {

  return gulp.src([
    config.src + '/wordpress/**/*'
  ])
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build:copy:index', function () {

  var scripts = '';
  switch (platform) {

    case 'planche':

      scripts = '<script type="text/javascript" src="config/host.js"><\/script>';
      break;

    case 'planche-wordpress':

      scripts = '<script type="text/javascript" src="config/hosts.php"><\/script>';
      break;
  }

  return gulp.src([
    config.src + '/index.html'
  ])
    .pipe(replace('{# scripts}', scripts))
    .pipe(replace('{# platform}', platform))
    .pipe(replace('{# Platform}', Platform))
    .pipe(replace('{# PLATFORM}', PLATFORM))
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build:copy:host', function () {

  return gulp.src([
    config.src + '/config/host.js'
  ])
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform]) + '/config'));
});

gulp.task('build:copy:tunneling:node', function () {

  var result = gulp.src([
    config.src + '/tunneling/nodejs/tunneling.js',
    config.src + '/tunneling/nodejs/planche.js'
  ]);

  if (platform !== 'planche-desktop') {

    result = result.pipe(concat('planche.js'));
  }

  result = result.pipe(gulp.dest(path.resolve(__dirname, config.dist[platform]) + '/tunneling'));

  return result;
});

gulp.task('build:copy:tunneling:php', function () {

  return gulp.src([
    config.src + '/tunneling/php/planche.php'
  ])
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform]) + '/tunneling'));
});

gulp.task('build:copy:package.json', function (cb) {

  var json = require('./package.json');

  delete json.planche;
  delete json.devDependencies;

  if (platform == 'planche-desktop') {

    json.devDependencies = {
      "electron": "^1.4.1",
      "electron-packager": "^8.3.0"
    };
  }

  delete json.scripts;

  if (platform == 'planche-desktop') {

    json.scripts = {
      start: 'npm update && electron .',
      php: 'php tunneling/planche.php',
      node: 'npm update && node tunneling/planche.js',
      packager: 'npm update && electron-packager . --all  --out=package --overwrite'
    }
  }
  else {

    json.scripts = {
      start: 'npm update && open index.html',
      php: 'php tunneling/planche.php',
      node: 'npm update && node tunneling/planche.js'
    }
  }

  if (platform == 'planche-desktop') {

    json.main = config.main[platform];
  }

  return file('package.json', JSON.stringify(json, null, 4), { src: true })
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build', function (cb) {

  var tasks = getBuildTasks();
  tasks.push(cb);
  runSequence.apply(this, tasks);
});

gulp.task('watch', function () {

  var src = config.src;

  setTimeout(function () {

    livereload.listen();

    gulp.watch([
      src + '/**/*',
      '!' + src + '/Application.js',
      '!' + src + '/entry.js',
      '!' + src + '/wordpress/**/*',
      '!' + src + '/electron/**/*',
      '!' + src + '/resources/**/*'
    ], ['build', 'livereload']);

    gulp.watch([
      src + '/resources/**/*'
    ], ['build:copy:resources']);

    if (platform == 'planche-wordpress') {

      gulp.watch([
        src + '/wordpress/**/*'
      ], ['build:copy:wordpress']);
    }

    if (platform == 'planche-chrome') {

      gulp.watch([
        src + '/chrome/**/*'
      ], ['build:copy:chrome']);
    }

    if (platform == 'planche-desktop') {

      gulp.watch([
        src + '/electron/**/*'
      ], ['build:copy:electron']);
    }

  }, 1000);
});

gulp.task('livereload', function () {
  return gulp.src([config.dist[platform] + '/*'])
    .pipe(livereload());
});

// 웹서버를 localhost:8000 로 실행한다.
gulp.task('server', function () {
  return gulp.src(path.resolve(__dirname, config.dist[platform]))
    .pipe(webserver({
      //host:'192.168.10.17'
    }));
});

gulp.task('open-electron', function (cb) {

  exec(
    'electron .',
    {
      cwd: path.resolve(__dirname, config.dist[platform])
    },
    function (err, stdout, stderr) {

      console.log(stdout);
      console.log(stderr);
      cb(err);
    }
  );
});

gulp.task('open-browser', function (cb) {

  exec('open ./dist/planche/index.html', function (err, stdout, stderr) {

    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('default', function (cb) {

  var tasks = [
    'build', 'build:copy:resources'
  ];

  if (platform == 'planche-wordpress') {

    tasks.push('build:copy:wordpress');
  }

  if (platform == 'planche-desktop') {

    tasks.push('build:copy:electron');
  }

  if (platform == 'planche-chrome') {

    tasks.push('build:copy:chrome');
  }

  tasks.push('server', 'watch');

  if (platform == 'planche') {

    // tasks.push('open-browser');
  }

  if (platform == 'planche-desktop') {

    tasks.push('open-electron');
  }

  tasks.push(cb);

  runSequence.apply(this, tasks);
});
