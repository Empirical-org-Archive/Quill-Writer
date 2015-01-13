var fs = require('fs');

module.exports =

angular.module('quill-writer.form.link', [
    'ui.router'
  ])

  .config(require('./link.config.js'))
  .controller('FormLinkCtrl', require('./link.controller.js'))
;
