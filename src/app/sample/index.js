var User = require('./../../common/services/user/');
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

  .controller('SampleCtrl', function($state, User){
    var sample = this;

    sample.availablePrompts = [
      {name: 'hello'},
      {name: 'sample 1'},
    ];

    sample.setUser = function(user) {
      User.setCurrentUser(user);
      $state.go('sf.game');
    };
  })

;

module.exports = 'sf.sample';
