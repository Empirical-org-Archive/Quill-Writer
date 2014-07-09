angular.module("sf.services.game", [
    'sf.constants',
    'sf.services.compass'
  ])

  .service("Game", function($firebase, baseFbUrl, Compass) {
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
          currentUser.name = "Player " + String(length + 1);
          gameUsers.$add(currentUser);
        }
        Compass.initializeGame(game, gameUsers, currentUser);
      });
      return game;
    };

    gameModel.closeGame = function(gameId) {
      var currentGame = $firebase(gameModel.get(gameId));
      currentGame.$update({status: 'ended'});
    };

    gameModel.sendSentence = function(gameId, sentence) {
      var game = gameModel.get(gameId);
      var sentences = game.$child("sentences");
      sentences.$add(sentence);
    };


  })

;

