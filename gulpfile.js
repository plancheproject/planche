var fs = require('fs');
var path = require('path');
var gulp = require('gulp');

var pkg = require('./package.json');
var commonConfig = require("./"+pkg.plancheSrc+'config.json');

var runSequence = require('run-sequence');

var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var replace = require("gulp-replace");
var exec = require('child_process').exec;
var shell = require('gulp-shell');
var del = require("del");
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');

var includeDirs = commonConfig.includeDirs;
var buildDir = pkg.buildDir;
var extjsSrc = pkg.extjsSrc;
var appDir = pkg.appDir;

gulp.task('clean', function(done) {
    del([
        appDir
    ]).then(function() {

        done();
    });
});

gulp.task('setting:Application.js', function() {

    return gulp.src(pkg.appDir + 'Application.js')
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
        pkg.plancheSrc + 'controller/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:dbms', function() {

    return gulp.src([
        pkg.plancheSrc + 'dbms/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:lib', function() {

    return gulp.src([
        pkg.plancheSrc + 'lib/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:model', function() {

    return gulp.src([
        pkg.plancheSrc + 'model/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:overrides', function() {

    return gulp.src([
        pkg.plancheSrc + 'overrides/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:plugins', function() {

    return gulp.src([
        pkg.plancheSrc + 'plugins/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:store', function() {

    return gulp.src([
        pkg.plancheSrc + 'store/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:view', function() {

    return gulp.src([
        pkg.plancheSrc + 'view/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:Application.js', function() {

    return gulp.src([
        pkg.plancheSrc + 'Application.js'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:Readme.md', function() {

    return gulp.src([
        pkg.plancheSrc + 'Readme.md'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:common_src:index.html', function() {

    return gulp.src([
        pkg.plancheSrc + 'index.html',
        pkg.plancheSrc + 'app.js'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir + "../"));
});

gulp.task('copy:common_src:resources', function() {

    return gulp.src([
        pkg.plancheSrc + 'resources/**/*'
    ], {base:pkg.plancheSrc})
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
    });
});

// 웹서버를 localhost:8000 로 실행한다.
gulp.task('server', function() {
    return gulp.src(pkg.appDir + "../")
        .pipe(webserver({
            //host:'192.168.10.17'
        }));
});

gulp.task('watch', function() {
    livereload.listen();

    gulp.watch(pkg.plancheSrc+'controller/**/*', ['copy:common_src:controller']);
    gulp.watch(pkg.plancheSrc+'dbms/**/*', ['copy:common_src:dbms']);
    gulp.watch(pkg.plancheSrc+'lib/**/*', ['copy:common_src:lib']);
    gulp.watch(pkg.plancheSrc+'model/**/*', ['copy:common_src:model']);
    gulp.watch(pkg.plancheSrc+'overrides/**/*', ['copy:common_src:overrides']);
    gulp.watch(pkg.plancheSrc+'plugins/**/*', ['copy:common_src:plugins']);
    gulp.watch(pkg.plancheSrc+'store/**/*', ['copy:common_src:store']);
    gulp.watch(pkg.plancheSrc+'view/**/*', ['copy:common_src:view']);
    gulp.watch(pkg.plancheSrc+'Readme.md', ['copy:common_src:Readme.md']);
    gulp.watch(pkg.plancheSrc+'resources/**/*', ['copy:common_src:resources']);
});

// gulp.task('default', ['build', 'watch']);
gulp.task('default', ['build', 'server', 'watch']);
