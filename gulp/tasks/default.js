'use strict';

var gulp = require('gulp');
var env = require('../utilities').env;
var runSequence = require('run-sequence');

gulp.task('default', function () {
  if (env.isDev()) {
    runSequence(
      ['clean'],
      ['assets', 'config', 'lint', 'styles', 'templates'],
      ['browserify:app', 'browserify:vendors'],
      ['index'],
      ['watch'],
      ['serve'],
      ['tdd']
    );
  } else if (env.isProd() || env.isStaging()) {
    runSequence(
      ['clean'],
      ['assets', 'config', 'lint', 'styles', 'templates'],
      ['browserify:app', 'browserify:vendors'],
      ['index']
    );
  }
});
