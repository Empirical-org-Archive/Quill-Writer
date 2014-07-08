angular.module('sf.home', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.home', {
        url: '/?uid&sid',
        views: {
          'content@': {
            // TODO - use html2js template cache
            templateUrl: 'app/home/home.tpl.html',
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
      if ($state.params.uid && $state.params.sid) {
        home.setUser({
          uid: $state.params.uid,
          sid: $state.params.uid
        });
      }
    }

    continueWithValidSession();
  })

;
