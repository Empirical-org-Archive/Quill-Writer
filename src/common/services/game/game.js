angular.module("sf.services.game", [
    'sf.constants'
  ])

  .service("Game", function($firebase, baseFbUrl) {
    var gameModel = this;

    var gamesRef = new Firebase(baseFbUrl + "/games");

    gameModel.currentGames = $firebase(gamesRef);

    gameModel.get = function(id) {
      return gameModel.currentGames.$child(id);
    };

    gameModel.getGameByUser = function(currentUser) {
      return gameModel.create(currentUser).then(function(gameId) {
        return gameModel.get(gameId);
      });
    };

    gameModel.create = function(user) {
      var gameData = {
        status: 'open'
      };

      var addGame = gameModel.currentGames.$add(gameData);

      return addGame.then(function(ref) {
        var gameId = ref.name();
        gameModel.addUser(gameId, user);
        return gameId;
      });
    };

    gameModel.addUser = function(gameId, user) {
      var game = gameModel.get(gameId),
        users = game.$child('users');

      var userCount = users.$getIndex().length;

      if(userCount >= 1) {
        game.$update({status: 'full'});
      }

      users.$add(user);
    };

    gameModel.closeGame = function(gameId) {
      var currentGame = gameModel.get(gameId);
      currentGame.$update({status: 'ended'});
    };

  })

;

