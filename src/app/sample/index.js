module.exports =

angular.module('quill-writer.sample', [
    'ui.router'
  ])

  .config(require('./sample.config.js'))
  .controller('SampleCtrl', require('./sample.controller.js'))
;
