var fs = require('fs');
var path = require('path');
var gulp = require('gulp');

var plancheConfig = require('./src/config.json');
var pkg = require('./package.json');

var runSequence = require('run-sequence');

var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var replace = require("gulp-replace");
var exec = require('child_process').exec;
var shell = require('gulp-shell');
var del = require("del");
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');

var includeDirs = plancheConfig.includeDirs;
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
        .pipe(replace(/requires\s+?:\s+?\[\]/g, "requires : " + JSON.stringify(plancheConfig.requires)))
        .pipe(replace(/views\s+?:\s+?\[\]/g, "views : " + JSON.stringify(plancheConfig.views)))
        .pipe(replace(/controllers\s+?:\s+?\[\]/g, "controllers : " + JSON.stringify(plancheConfig.controllers)))
        .pipe(replace(/stores\s+?:\s+?\[\]/g, "stores : " + JSON.stringify(plancheConfig.stores)))
        .pipe(gulp.dest(appDir));
});

gulp.task('copy', [
    'copy:source:controller',
    'copy:source:dbms',
    'copy:source:lib',
    'copy:source:model',
    'copy:source:overrides',
    'copy:source:plugins',
    'copy:source:store',
    'copy:source:view',
    'copy:source:Application.js',
    'copy:source:Readme.md',
    'copy:resources',
    'copy:index.html'
]);

gulp.task('copy:source:controller', function() {

    return gulp.src([
        pkg.plancheSrc + 'controller/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:source:dbms', function() {

    return gulp.src([
        pkg.plancheSrc + 'dbms/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:source:lib', function() {

    return gulp.src([
        pkg.plancheSrc + 'lib/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:source:model', function() {

    return gulp.src([
        pkg.plancheSrc + 'model/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:source:overrides', function() {

    return gulp.src([
        pkg.plancheSrc + 'overrides/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:source:plugins', function() {

    return gulp.src([
        pkg.plancheSrc + 'plugins/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:source:store', function() {

    return gulp.src([
        pkg.plancheSrc + 'store/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:source:view', function() {

    return gulp.src([
        pkg.plancheSrc + 'view/**/*'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:source:Application.js', function() {

    return gulp.src([
        pkg.plancheSrc + 'Application.js'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:source:Readme.md', function() {

    return gulp.src([
        pkg.plancheSrc + 'Readme.md'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir));
});

gulp.task('copy:index.html', function() {

    return gulp.src([
        pkg.plancheSrc + 'index.html',
        pkg.plancheSrc + 'app.js'
    ], {base:pkg.plancheSrc})
    .pipe(gulp.dest(appDir + "../"));
});

gulp.task('copy:resources', function() {

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
        done);
});

gulp.task('build:sencha', function (cb) {

    del([
        buildDir + "/*"
    ])
    .then(function() {

        exec('cd application && sencha app build', function (err, stdout, stderr) {

            // console.log(stdout);
            // console.log(stderr);

            exec('cp -rf application/build/production/planche/* build/', function (err, stdout, stderr) {

                // console.log(stdout);
                // console.log(stderr);
            });
        });
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

    gulp.watch(pkg.plancheSrc+'/controller/**/*', ['copy:source:controller']);
    gulp.watch(pkg.plancheSrc+'/dbms/**/*', ['copy:source:dbms']);
    gulp.watch(pkg.plancheSrc+'/lib/**/*', ['copy:source:lib']);
    gulp.watch(pkg.plancheSrc+'/model/**/*', ['copy:source:model']);
    gulp.watch(pkg.plancheSrc+'/overrides/**/*', ['copy:source:overrides']);
    gulp.watch(pkg.plancheSrc+'/plugins/**/*', ['copy:source:plugins']);
    gulp.watch(pkg.plancheSrc+'/store/**/*', ['copy:source:store']);
    gulp.watch(pkg.plancheSrc+'/view/**/*', ['copy:source:view']);
    gulp.watch(pkg.plancheSrc+'/Readme.md', ['copy:source:Readme.md']);
});

// gulp.task('default', ['build', 'watch']);
gulp.task('default', ['build', 'server', 'watch']);
