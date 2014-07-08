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
      var gameUsers = $firebase(game.child("users"));
      if (gameUsers.$getIndex().length < 1) {
        gameUsers.$add(currentUser);
      }
      return $firebase(game);
    };

    gameModel.closeGame = function(gameId) {
      var currentGame = $firebase(gameModel.get(gameId));
      currentGame.$update({status: 'ended'});
    };

  })

;

