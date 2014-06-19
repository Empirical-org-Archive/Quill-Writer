angular.module('sf.user', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.users.user', {
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