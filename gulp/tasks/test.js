'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var config = require('../config').test;
console.log(config);
/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: config.configFile,
    singleRun: true
  }, done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  karma.start({
    configFile: config.configFile
  }, done);
});
