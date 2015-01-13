module.exports =

angular.module('quill-writer.link', [
    'ui.router'
  ])

  .config(require('./link.config.js'))
  .controller('LinkCtrl', require('./link.controller.js'))
;
