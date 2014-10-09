angular.module('sf.services.user', [])

  .service('User', function(localStorageService, $analytics) {
    var user = this;

    user.currentUser = null;
    user.currentUserKey = 'currentUser';

    user.setCurrentUser = function(newUser) {
      if (user.currentUser === null) {
        //Track new user if currentUser is null
        $analytics.eventTrack('Quill-Writer New User Session');
      }
      user.currentUser = newUser;
      localStorageService.set(user.currentUserKey, newUser);
    };

    user.getUserFromLocalStorage = function() {
      return localStorageService.get(user.currentUserKey);
    };
  })

;

module.exports = 'sf.services.user';
