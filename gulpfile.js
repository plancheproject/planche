var fs = require('fs');
var path = require('path');
var gulp = require('gulp');

var config = require('./package.json').planche;
var commonConfig = require("./"+config.plancheSrc+'config.json');
var tunnelingConfig = config.tunneling;

var runSequence = require('run-sequence');

var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var replace = require("gulp-replace");
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var shell = require('gulp-shell');
var del = require("del");
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');

var includeDirs = commonConfig.includeDirs;
var buildDir = config.buildDir;
var extjsSrc = config.extjsSrc;
var appDir = config.appDir;

gulp.task('clean', function(done) {
    del([
        appDir
    ]).then(function() {

        done();
    });
});

gulp.task('setting:Application.js', function() {

    return gulp.src(config.appDir + 'Application.js')
        .pipe(replace(/requires\s+?:\s+?\[\]/g, "requires : " + JSON.stringify(commonConfig.requires)))
        .pipe(replace(/views\s+?:\s+?\[\]/g, "views : " + JSON.stringify(commonConfig.views)))
        .pipe(replace(/controllers\s+?:\s+?\[\]/g, "controllers : " + JSON.stringify(commonConfig.controllers)))
        .pipe(replace(/stores\s+?:\s+?\[\]/g, "stores : " + JSON.stringify(commonConfig.stores)))
        .pipe(gulp.dest(appDir));
});

gulp.task('copy', [
    'copy:common_src:controller',
    'copy:common_src:dbms',
    'copy:common_src:lib',
    'copy:common_src:model',
    'copy:common_src:overrides',
    'copy:common_src:plugins',
    'copy:common_src:store',
    'copy:common_src:view',
    'copy:common_src:Application.js',
    'copy:common_src:Readme.md',
    'copy:common_src:resources',
    'copy:common_src:index.html'
]);

gulp.task('copy:common_src:controller', function() {

    return gulp.src([
        config.plancheSrc + 'controller/**/*'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:dbms', function() {

    return gulp.src([
        config.plancheSrc + 'dbms/**/*'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:lib', function() {

    return gulp.src([
        config.plancheSrc + 'lib/**/*'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:model', function() {

    return gulp.src([
        config.plancheSrc + 'model/**/*'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:overrides', function() {

    return gulp.src([
        config.plancheSrc + 'overrides/**/*'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:plugins', function() {

    return gulp.src([
        config.plancheSrc + 'plugins/**/*'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:store', function() {

    return gulp.src([
        config.plancheSrc + 'store/**/*'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:view', function() {

    return gulp.src([
        config.plancheSrc + 'view/**/*'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:Application.js', function() {

    return gulp.src([
        config.plancheSrc + 'Application.js'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:Readme.md', function() {

    return gulp.src([
        config.plancheSrc + 'Readme.md'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:index.html', function() {

    return gulp.src([
        config.plancheSrc + 'index.html',
        config.plancheSrc + 'app.js'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir + "../"));
});

gulp.task('copy:common_src:resources', function() {

    return gulp.src([
        config.plancheSrc + 'resources/**/*'
    ], {base:config.plancheSrc})
    .pipe(gulp.dest(appDir+"../"));
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('build', function(done) {
    runSequence(
        'clean',
        'copy',
        'setting:Application.js',
        'build:sencha',
        done);
});

gulp.task('build:sencha', function (cb) {

    exec('./build.sh', function(err, stdout, stderr){

        console.log(stdout);
        console.log(stderr);

        cb(err);
    });
});

gulp.task('run:php', function (cb) {

    const task = spawn('php', [
        tunnelingConfig.path + 'php/planche.php', tunnelingConfig.host, tunnelingConfig.port
    ]);

    task.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    task.stderr.on('data', (data) => {
        console.log(data.toString());
    });

    return cb;
});

gulp.task('run:node', function (cb) {

    const task = spawn('node', [
        tunnelingConfig.path + 'nodejs/planche.js', tunnelingConfig.host, tunnelingConfig.port
    ]);

    task.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    task.stderr.on('data', (data) => {
        console.log(data.toString());
    });

    return cb;
});

// 웹서버를 localhost:8000 로 실행한다.
gulp.task('server', function() {
    return gulp.src(config.appDir + "../")
        .pipe(webserver({
            //host:'192.168.10.17'
        }));
});

gulp.task('watch', function() {

    var src = config.plancheSrc;

    livereload.listen();

    gulp.watch(src+'controller/**/*', ['copy:common_src:controller']);
    gulp.watch(src+'dbms/**/*', ['copy:common_src:dbms']);
    gulp.watch(src+'lib/**/*', ['copy:common_src:lib']);
    gulp.watch(src+'model/**/*', ['copy:common_src:model']);
    gulp.watch(src+'overrides/**/*', ['copy:common_src:overrides']);
    gulp.watch(src+'plugins/**/*', ['copy:common_src:plugins']);
    gulp.watch(src+'store/**/*', ['copy:common_src:store']);
    gulp.watch(src+'view/**/*', ['copy:common_src:view']);
    gulp.watch(src+'Readme.md', ['copy:common_src:Readme.md']);
    gulp.watch(src+'resources/**/*', ['copy:common_src:resources']);
});

// gulp.task('default', ['build', 'watch']);
gulp.task('default', ['build', 'server', 'watch']);
