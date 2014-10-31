var User = require('./../../common/services/user/');
var Empirical = require('./../../common/services/empirical/');
var fs = require('fs');

angular.module('sf.sample', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.sample', {
        url: '/sample',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + '/sample.tpl.html'),
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
      sample.availablePrompts = prompts;
    });

    sample.setUser = function(user) {
      User.setCurrentUser(user);
      $state.go('sf.game');
    };

    sample.next = function(p, un) {
      $state.go('sf.lobby', {id: p.id, name: p.name, userName: un});
    };
  })

;

module.exports = 'sf.sample';
