'use strict';
var gulp            = require('gulp'),
    fs              = require("fs"),
    cmq             = require('gulp-combine-mq'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('autoprefixer'),
    postcss         = require('gulp-postcss');


var dirs = {
    dev_sass:    './css',
    dev_scripts:   './js',
    prod_css:  '../css',
    prod_scripts: '../js'
};


/*
 *  CSS task
 */

/**
 * CSS task used to transpile SASS
 */
gulp.task('styles', function () {

    console.log('starting task: [styles]');

    gulp.src(dirs.dev_sass + '/style.scss')
        .pipe(sass({ errLogToConsole: true }))
        .pipe(cmq())
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest(dirs.prod_css));
});

/*
 *  WATCH tasks to serve up
 */
gulp.task('watch', ['styles'], function () {
    gulp.watch(dirs.dev_sass + '/**/*.scss', ['styles']);
   // gulp.watch(dirs.dev_scripts + '/**/*.js', ['scripts']);
});


/*
 *  DEFAULT tasks to serve up
 */
gulp.task('default', ['styles']);

