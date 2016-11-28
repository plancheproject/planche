var gulp = require('gulp');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');
var config = require('./package.json').planche;
var concat = require('gulp-concat');
var replace= require('gulp-replace');
var path = require('path')
var runSequence = require('run-sequence');
var exec = require('child_process').exec;

var arguments = {
  platform : 'planche'
};

var args = process.argv.slice(2);
for(var i in args) {

  var tmp = args[i].split("=");
  arguments[tmp[0].slice(2)] = tmp[1];
}

var platform = arguments.platform;
var tmp = platform.split("-");
var Platform = '';

if(tmp.length > 1){

  Platform = tmp[0][0].toUpperCase() + tmp[0].slice(1) + '-' + tmp[1][0].toUpperCase() + tmp[1].slice(1);
}
else {

  Platform = tmp[0][0].toUpperCase() + tmp[0].slice(1);
}

var PLATFORM = platform.toUpperCase();

var entry = require('./build_modules/gulp-planche-make-entry');

var getBuildTasks = function(){

  var tasks = [
    'build:make:entry',
    'build:webpack',
    'build:copy:index'
  ];

  if(platform == 'planche'){

    tasks.push(
      'build:copy:host',
      'build:copy:tunneling:node',
      'build:copy:tunneling:php'
    );
  }

  if(platform == 'planche-desktop'){

    tasks.push(
      'build:copy:electron',
      'build:copy:tunneling:node',
      'build:copy:tunneling:php'
    )
  }

  return tasks;
};

gulp.task('build:make:entry', function(){
  gulp.src([
    config.src + '/Application.json'
  ])
  .pipe(entry({
    source : config.src,
    Platform : Platform
  }))
});

gulp.task('build:webpack', function(){

  return gulp.src(config.src + '/entry.js')
    .pipe(webpackStream({
        entry: path.resolve(__dirname, config.src) + "/entry.js",
        output: {
            path: path.resolve(__dirname, config.dist[platform]),
            filename: "app.bundle.js",
            sourceMapFilename : "[file].map"
        },
        plugins: [new webpack.optimize.UglifyJsPlugin()],
        devtool: 'source-map'
    }))
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build:copy:resources', function() {

    return gulp.src([
        config.src + '/resources/**/*'
    ], {base:config.src})
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build:copy:electron', function() {

    return gulp.src([
        config.src + '/electron/**/*'
    ])
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build:copy:wordpress', function() {

    return gulp.src([
        config.src + '/wordpress/**/*'
    ])
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform])));
});

gulp.task('build:copy:index', function() {

  var scripts = '';
  switch(platform){

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

gulp.task('build:copy:host', function() {

    return gulp.src([
        config.src + '/config/host.js'
    ])
    .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform]) + '/config'));
});

gulp.task('build:copy:tunneling:node', function(){

  return gulp.src([
      config.src + '/tunneling/nodejs/tunneling.js',
      config.src + '/tunneling/nodejs/planche.js'
  ])
  .pipe(concat('planche.js'))
  .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform]) + '/tunneling'));
});

gulp.task('build:copy:tunneling:php', function(){

  return gulp.src([
      config.src + '/tunneling/php/planche.php'
  ])
  .pipe(gulp.dest(path.resolve(__dirname, config.dist[platform]) + '/tunneling'));
});

gulp.task('build', function(cb){

  var tasks = getBuildTasks();
  tasks.push(cb);
  runSequence.apply(this, tasks);
});

gulp.task('watch', function() {

    var src = config.src;

    setTimeout(function(){

        livereload.listen();

        gulp.watch([
          src+'/**/*',
          '!' + src + '/Application.js',
          '!' + src + '/entry.js',
          '!' + src + '/wordpress/**/*',
          '!' + src + '/electron/**/*',
          '!' + src + '/resources/**/*'
        ], ['build', 'livereload']);

        gulp.watch([
          src + '/resources/**/*'
        ], ['build:copy:resources']);

        if(platform == 'planche-wordpress'){

          gulp.watch([
            src + '/wordpress/**/*'
          ], ['build:copy:wordpress']);
        }

        if(platform == 'planche-desktop'){

          gulp.watch([
            src + '/electron/**/*'
          ], ['build:copy:electron']);
        }

    }, 1000);
});

gulp.task('livereload', function() {
    return gulp.src([config.dist[platform] + '/*'])
        .pipe(livereload());
});

// 웹서버를 localhost:8000 로 실행한다.
gulp.task('server', function() {
    return gulp.src(path.resolve(__dirname, config.dist[platform]))
        .pipe(webserver({
            //host:'192.168.10.17'
        }));
});

gulp.task('open-electron', function(cb){

  exec('electron dist/planche-desktop', function (err, stdout, stderr) {

    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('open-browser', function(cb){

  exec('open ./dist/planche/index.html', function (err, stdout, stderr) {

    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('default', function(cb){

  var tasks = [
    'build', 'build:copy:resources'
  ];

  if(platform == 'planche-wordpress'){

    tasks.push('build:copy:wordpress');
  }

  if(platform == 'planche-desktop'){

    tasks.push('build:copy:electron');
  }

  tasks.push('server', 'watch');

  if(platform == 'planche'){

    tasks.push('open-browser');
  }

  if(platform == 'planche-desktop'){

    tasks.push('open-electron');
  }

  tasks.push(cb);

  runSequence.apply(this, tasks);
});
