module.exports =

angular.module('quill-writer.myactivity', [
    'ui.router'
  ])

  .config(require('./myactivity.config.js'))

  .controller('MyactivityCtrl', require('./myactivity.controller.js'))

;
