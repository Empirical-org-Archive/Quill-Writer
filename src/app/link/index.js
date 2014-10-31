var User = require('./../../common/services/user/');
var Empirical = require('./../../common/services/empirical/');
var fs = require('fs');

angular.module('sf.link', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.link', {
        url: '/link',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + '/link.tpl.html'),
            controller: 'LinkCtrl as link'
          }
        }
      });
  })

  .controller('LinkCtrl', function($state, User, Empirical, _){
    var link = this;

    Empirical.getAvailablePrompts().$loaded().then(function(prompts) {
      prompts = _.each(prompts, function(p) {
        p.id = p.$id;
      });
      link.availablePrompts = prompts;
    });

    link.setUser = function(user) {
      User.setCurrentUser(user);
      $state.go('sf.game');
    };

    link.next = function(p, un) {
      $state.go('sf.lobby', {id: p.id, name: p.name, userName: un});
    };
  })

;

module.exports = 'sf.link';
