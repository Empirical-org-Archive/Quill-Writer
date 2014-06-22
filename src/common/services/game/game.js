angular.module("sf.services.game", [
    'sf.constants'
  ])

  .service("Game", function($firebase, baseFbUrl) {
    var game = this;

    game.currentGame = null;

    var gamesRef = new Firebase(baseFbUrl + "/games");
    game.currentGames = $firebase(gamesRef);

    game.get = function(id) {
      var ref = new Firebase(gamesRef + '/' + id);
      return $firebase(ref);
    };

    game.getGames = function() {
      return game.currentGames;
    };

    game.create = function(user) {
      var gameData = {
        status: 'open',
        creator: user,
        users: [user]
      };

      return game.currentGames.$add(gameData);
    };

    game.join = function(gameId, user) {
      var currentGame = game.get(gameId);
      addUser(currentGame, user);

      return currentGame;
    };

    function addUser(currentGame, user) {
      var users = game.get(currentGame.$id + '/users');
      currentGame.$update({status: 'full'});
      users.$add(user);
    }

    game.closeGame = function(gameId) {
      var currentGame = game.get(gameId);
      currentGame.$update({status: 'ended'});
    };

  })

;

