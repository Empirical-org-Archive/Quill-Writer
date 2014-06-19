angular.module('app.services.user', [])

  .service('User', function() {
    var user = this;

    // fake get method
    // would normally use $http
    user.get = function(id) {
      for(var i = 0; i < usersResource.length; i++) {
        var user = usersResource[i];
        if(user.id == id) return user;
      }
    };

    // fake query method
    // would normally use $http
    user.query = function() {
      return usersResource;
    };

    // mock resource
    // would normally be return from an api call
    var usersResource = [
      {
        id: 1,
        name: 'Billy'
      },
      {
        id: 2,
        name: 'Bobby'
      },
      {
        id: 3,
        name: 'Peggy-Sue'
      }
    ];

  })

;