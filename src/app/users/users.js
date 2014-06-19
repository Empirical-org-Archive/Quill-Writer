angular.module('app.users', [
    'app.user',
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('app.users', {
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
