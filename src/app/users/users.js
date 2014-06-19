angular.module('sf.users', [
    'sf.user',
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.users', {
        url: '/users',
        views: {
          'content@': {
            // TODO - use html2js template cache
            templateUrl: 'app/users/users.tpl.html',
            controller: 'UsersCtrl as users'
          }
        }
      });
  })

  .controller('UsersCtrl', function(User){
    var users = this;

    users.users = User.query();

    users.createUser = function(user) {
      User.create(user);
    };
  })

;
