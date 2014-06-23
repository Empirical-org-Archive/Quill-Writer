angular.module('sf.lobby', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.lobby', {
        url: '/lobby',
        views: {
          'content@': {
            // TODO - use html2js template cache
            templateUrl: 'app/lobby/lobby.tpl.html',
            controller: 'LobbyCtrl as lobby'
          }
        }
      });
  })

  .controller('LobbyCtrl', function($state, User, Game){
    var lobby = this;

    lobby.user = User.currentUser;

    // send the user back to the home page here if not signed in
    // could use a more sophisticated resolve function in ui-router
    // should also include a notification (could use $state.data)
    if(!lobby.user) $state.go('sf.home');

    lobby.games = Game.currentGames;

    lobby.createGame = function(user) {
      Game.create(user).then(function(gameId) {
        sendToGame(gameId);
      });
    };

    lobby.joinGame = function(gameId) {
      Game.addUser(gameId, lobby.user);
      sendToGame(gameId);
    };

    function sendToGame(id) {
      // this is the random key firebase generates
      $state.go('sf.game', {id: id});
    }
  })

;
