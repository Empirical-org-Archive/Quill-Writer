var fs = require('fs');

angular.module('quill-writer.form.link', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('quill-writer.form.link', {
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
      $state.go('quill-writer.form');
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

module.exports = 'quill-writer.form.link';
