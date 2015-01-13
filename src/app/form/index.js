var fs = require('fs');

module.exports =

angular.module('quill-writer.form', [
    'ui.router'
  ])

  .config(require('./form.config.js'))
  .controller('FormCtrl', require('./form.controller.js'))
;
