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

  .controller('FormLinkCtrl', function($state) {
    var formLink = this;
    formLink.link = $state.data.link;
  })

;

module.exports = 'sf.form.link';
