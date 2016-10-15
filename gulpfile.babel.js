'use strict';

import gulp from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import gutil from 'gulp-util';
import sourcemaps from 'gulp-sourcemaps';
import ngAnnotate from 'gulp-ng-annotate';
import concat from 'gulp-concat';
import sass from 'gulp-sass';
import babel from 'gulp-babel'
import Cache from 'gulp-file-cache';
import babelify from 'babelify';
import uglify from 'gulp-uglify';

const appPath = 'client/app.js';

//--------------------------------------------------------
// Scripts
//--------------------------------------------------------

const b = browserify({
        entries: appPath,
        debug: true,
        cache: {},
        packageCache: {},
        transform: [babelify]
});

b.on('update', bundle);
b.on('log', gutil.log.bind(gutil.colors.blue, 'js: '));

gulp.task('js', bundle);

function bundle() {
    b.bundle()
        .on('error', err => {gutil.log(gutil.colors.red('Browserify compile error: ', err.message));})
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // other transformations here
            .pipe(concat('main.min.js', {newLine: ';'}))
            .pipe(ngAnnotate({add:true, single_quotes: true}))
            .pipe(uglify({mangle: false}))
        // other transformations end here
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('client'));
}

gulp.task('copy-libs', () => {

    const entries = [
        'node_modules/angular/angular.min.js',
        'node_modules/angular-ui-router/build/angular-ui-router.min.js',
        'node_modules/angular-animate/angular-animate.min.js',
        'node_modules/angular-local-storage/dist/angular-local-storage.min.js',
        'node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js',
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/satellizer/satellizer.min.js',
        'node_modules/angular-loading-overlay-http-interceptor/dist/angular-loading-overlay-http-interceptor.js',
        'node_modules/angular-sanitize/angular-sanitize.min.js'
    ];

    gulp.src(entries)
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('client/libs'));

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
        .src( 'client/sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('client/css'));
});

//--------------------------------------------------------
// Node compile
//--------------------------------------------------------

let cache = new Cache();

gulp.task('compile',
    () => gulp.src('./server/src/**/*.js')
            .pipe(cache.filter())
            .pipe(babel())
            .pipe(cache.cache())
            .pipe(gulp.dest('./server/dist'))
);

//--------------------------------------------------------
// Build project
//--------------------------------------------------------

gulp.task('build', ['copy-libs', 'compile', 'js', 'styles']);
