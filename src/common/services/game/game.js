angular.module("sf.services.game", [
    'sf.constants'
  ])

  .service("Game", function($firebase, baseFbUrl) {
    var gameModel = this;

    var gamesRef = new Firebase(baseFbUrl + "/games");

    gameModel.get = function(id) {
      return gamesRef.child(id);
    };

    gameModel.getGameByUser = function(currentUser) {
      var game = gameModel.get(currentUser.sid);
      var init = $firebase(game.child("init"));
      if (!init.value) {
        var gameUsers = $firebase(game.child("users"));
        if (gameUsers.$getIndex().length < 2) {
          gameUsers.$add(currentUser);
        }
        init.$set(true);
      }
      return $firebase(game);
    };

    gameModel.closeGame = function(gameId) {
      var currentGame = gameModel.get(gameId);
      currentGame.$update({status: 'ended'});
    };

  })

;

