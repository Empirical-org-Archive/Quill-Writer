angular.module('sf.services.user', [])

  .service('User', function() {
    var user = this;

    user.currentUser = null;

    user.setCurrentUser = function(newUser) {
      user.currentUser = newUser;
    };
  })

;
