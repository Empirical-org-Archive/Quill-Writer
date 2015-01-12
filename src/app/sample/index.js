module.exports = 

angular.module('quill-writer.sample', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('quill-writer.sample', {
        url: '/sample',
        views: {
          'content@': {
            templateUrl: 'sample.tpl.html',
            controller: 'SampleCtrl as sample'
          }
        }
      });
  })

  .controller('SampleCtrl', function($state, User, Empirical, _){
    var sample = this;

    Empirical.getAvailablePrompts().$loaded().then(function(prompts) {
      prompts = _.each(prompts, function(p) {
        p.id = p.$id;
      });
      prompts = _.filter(prompts, function(p) {
        return !p.private;
      });
      sample.availablePrompts = prompts;
    });

    sample.next = function(p, un) {
      $state.go('quill-writer.link', {id: p.id, name: p.name});
    };
  })

;