angular.module("sf.services.game", [
    'sf.constants'
  ])

  .service("Game", function($firebase, baseFbUrl) {
    var gameModel = this;

    var gamesRef = new Firebase(baseFbUrl + "/games");

    gameModel.get = function(id) {
      return $firebase(gamesRef).$child(id);
    };

    gameModel.getGameByUser = function(currentUser) {
      var game = gameModel.get(currentUser.sid);
      var gameUsers = game.$child("users");
      gameUsers.$on('loaded', function() {
        var length = gameUsers.$getIndex().length;
        if (length < 2) {
          gameUsers.$add(currentUser);
        }
      });
      return game;
    };

    gameModel.closeGame = function(gameId) {
      var currentGame = $firebase(gameModel.get(gameId));
      currentGame.$update({status: 'ended'});
    };

  })

;

