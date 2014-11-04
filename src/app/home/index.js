var User = require('./../../common/services/user/');
var fs = require('fs');

angular.module('sf.home', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.home', {
        url: '/?uid&sid&activityPrompt',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + '/home.tpl.html'),
            controller: 'HomeCtrl as home'
          }
        }
      });
  })

  .controller('HomeCtrl', function($state, User){
    var home = this;

    home.setUser = function(user) {
      User.setCurrentUser(user);
      $state.go('sf.game');
    };

    function continueWithValidSession() {
      if ($state.params.uid && $state.params.sid && $state.params.activityPrompt) {
        home.setUser({
          uid: $state.params.uid,
          sid: $state.params.sid,
          activityPrompt: $state.params.activityPrompt
        });
      } else {
        var user = User.getUserFromLocalStorage();
        if (user) {
          home.setUser(user);
        }
      }
    }

    home.trySampleActivity = function() {
      $state.go('sf.sample');
    };

    home.createNewActivity = function() {
      $state.go('sf.form');
    };

    //continueWithValidSession();
  })

;

module.exports = 'sf.home';
