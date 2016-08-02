'use strict';

require('babel-register');

import gulp from 'gulp';
import domain from 'domain';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import gutil from 'gulp-util';
import sourcemaps from 'gulp-sourcemaps';
import tap from 'gulp-tap';
import ngAnnotate from 'gulp-ng-annotate';
import concat from 'gulp-concat';
import browserSync from 'browser-sync';
import nodemon from 'gulp-nodemon';
import sass from 'gulp-sass';
import babel from 'gulp-babel'
import Cache from 'gulp-file-cache';
import babelify from 'babelify';

import uglify from 'gulp-uglify';

const BROWSER_SYNC_RELOAD_DELAY = 3000;
const appPath = 'app/app.js';

//watchify    = require('watchify');
//rename      = require('gulp-rename')
//jshint      = require('gulp-jshint')

//--------------------------------------------------------
// Scripts
//--------------------------------------------------------

gulp.task('js',() => {

    const b = browserify({
        entries: appPath,
        debug: true
    }).transform(babelify);

    b.ignore('angular');

    gulp.src(appPath, {read: false})
        .pipe(tap(file => {
            const d = domain.create();

            d.on("error", err => {
                gutil.log(
                    gutil.colors.red("Browserify compile error: "),
                    err.message,
                    "\n\t",
                    gutil.colors.cyan("in file"),
                    file.path
                );
                gutil.beep();
            });

            d.run(
                () => b.bundle()
                    .pipe(source('main.js'))
                    .pipe(buffer())
                    .pipe(sourcemaps.init({loadMaps: true}))
                    // other transformations here
                        .pipe(concat('main.min.js', {newLine: ';'}))
                        .pipe(ngAnnotate())
                    //.pipe(uglify({compress: {sequences: false, join_vars: false}}))
                    // other transformations end here
                    .on('error', gutil.log)
                    .pipe(sourcemaps.write('./'))
                    .pipe(gulp.dest('./app')));

        }));
});

gulp.task('copy-libs', () => {

    const entries = [
        'node_modules/angular/angular.min.js',
        'node_modules/angular-ui-router/build/angular-ui-router.min.js',
        'node_modules/angular-animate/angular-animate.min.js',
        'node_modules/angular-local-storage/dist/angular-local-storage.min.js',
        'node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js',
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/satellizer/satellizer.min.js',
        'node_modules/ng-file-upload/dist/ng-file-upload-all.min.js'
    ];

    gulp.src(entries)
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/libs'));

});

//--------------------------------------------------------
// Styles
//--------------------------------------------------------

gulp.task('styles', () => {

    const sassOptions = {
        includePaths: ['node_modules/bootstrap-sass/assets/stylesheets'],
        errLogToConsole: true,
        outputStyle: 'compressed'
    };

    return gulp
        .src( 'app/sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream());

});

//--------------------------------------------------------
// Nodemon
//--------------------------------------------------------

let cache = new Cache();

gulp.task('compile',
    () => gulp.src('./server/**/*.js')
            .pipe(cache.filter())
            .pipe(babel())
            .pipe(cache.cache())
            .pipe(gulp.dest('./dist'))
);


gulp.task('nodemon', ['compile'], cb => {
    let called = false;
    return nodemon({
        script: 'dist/server.js',
        watch: 'server',
        ext: 'js',
        ignore: 'app/*',
        tasks: ['compile'],
        env: {'NODE_ENV': 'development'}
    }).on('start', () => {
        if (!called) {cb();}
        called = true;
    }).on('restart', () => {
        setTimeout(() => {browserSync.reload({stream: false});}, BROWSER_SYNC_RELOAD_DELAY);
    });
});

//--------------------------------------------------------
// Browser-Sync
//--------------------------------------------------------

gulp.task('browser-sync', ['nodemon'], () => {
    browserSync({
        proxy: 'http://localhost:5000',
        port: 7000
    });
});

gulp.task('bs-reload', () => {browserSync.reload();});

//--------------------------------------------------------
// Watch
//--------------------------------------------------------

gulp.task('watch', () => {
    gulp.watch('app/**/*.js', ['js']);
    gulp.watch('app/**/*.html', ['bs-reload']);
    gulp.watch('app/**/*.scss', ['styles', 'bs-reload']);
});

//--------------------------------------------------------
// Default Task
//--------------------------------------------------------

gulp.task('default', ['copy-libs', 'browser-sync', 'js', 'styles', 'watch']);
