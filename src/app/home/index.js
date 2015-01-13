module.exports =

angular.module('quill-writer.home', [
    'ui.router'
  ])

  .config(require('./home.config.js'))
  .controller('HomeCtrl', require('./home.controller.js'))
;
