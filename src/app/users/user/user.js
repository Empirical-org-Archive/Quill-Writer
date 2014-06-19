angular.module('app.user', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('app.users.user', {
        url: '/:id',
        views: {
          'content@': {
            templateUrl: 'app/users/user/user.tpl.html',
            controller: 'UserCtrl as user'
          }
        }
      });
  })

  .controller('UserCtrl', function($stateParams, User) {
    var user = this;

    user.user = User.get($stateParams.id);
  })
;