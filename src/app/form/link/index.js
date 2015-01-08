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
            templateUrl: 'link.tpl.html',
            controller: 'FormLinkCtrl as formLink'
          }
        }
      });
  })

  .controller('FormLinkCtrl', function($state) {
    var formLink = this;

    if (!$state.data || !$state.data.link) {
      $state.go('sf.form');
      return;
    } else {
      formLink.link = $state.data.link;
    }

    formLink.getLink = function() {
      console.log("Going to copy %s", formLink.link);
      return formLink.link;
    }
    formLink.fallback = function(copy) {
      window.prompt('Press cmd+c(Mac) or ctrl-c(Windows) to copy the text below.', copy);
    };
  })

;

module.exports = 'sf.form.link';
