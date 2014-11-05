var fs = require('fs');

angular.module('sf.form.link', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.form.link', {
        url: '/link',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + '/link.tpl.html'),
            controller: 'FormLinkCtrl as formLink'
          }
        }
      });
  })

  .controller('FormLinkCtrl', function(Form) {
    var formLink = this;
  })

;

module.exports = 'sf.form.link';
