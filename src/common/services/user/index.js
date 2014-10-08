angular.module('sf.services.user', [])

  .service('User', function(localStorageService) {
    var user = this;

    user.currentUser = null;
    user.currentUserKey = 'currentUser';

    user.setCurrentUser = function(newUser) {
      user.currentUser = newUser;
      localStorageService.set(user.currentUserKey, newUser);
    };
  })

;

module.exports = 'sf.services.user';
