var sfConstants = require('../../constants');
var sfCompass = require('../compass');
angular.module("sf.services.game", [
    sfConstants,
    sfCompass,
  ])

  .service("Game", function($firebase, baseFbUrl, Compass) {
    var gameModel = this;

    var gamesRef = new Firebase(baseFbUrl + "/games");

    gameModel.get = function(id) {
      return $firebase(gameModel.getRef(id));
    };

    gameModel.getRef = function(id) {
      return gamesRef.child(id);
    }

    gameModel.getGameByUser = function(User) {
      var currentUser = User.currentUser;
      var gameRef = gameModel.getRef(currentUser.sid);
      var gameUsersRef = gameRef.child("users");
      var gameUsers = $firebase(gameUsersRef).$asObject();
      var game = $firebase(gameRef);
      gameUsers.$loaded().then(function() {
        var length = gameUsers.length
        if (length < 2) {
          currentUser.name = "Player " + String(length + 1);
          currentUser.isTheirTurn = currentUser.name === "Player 1";
          User.localUser = currentUser.name;
          gameUsers.$add(currentUser);
        }
        Compass.initializeGame(game, gameUsers, currentUser);
      });
      var wordsUsed = $firebase(gameRef.child("wordsUsed")).$asObject();
      var wordsUsedLength = $firebase(gameRef.child("wordsUsedLength")).$asObject();
      game.wordsUsed = wordsUsed;
      game.wordsUsedLength = wordsUsedLength;
      return game;
    };

    gameModel.getSentences = function(gameId) {
      return $firebase(gameModel.getRef(gameId).child("sentences")).$asArray();
    }

    gameModel.closeGame = function(gameId) {
      var currentGame = $firebase(gameModel.get(gameId));
      currentGame.$update({status: 'ended'});
    };

    gameModel.sendSentence = function(gameId, sentence) {
      gameModel.getSentences(gameId).$add(sentence);
    };

    gameModel.takeTurns = function(gameId) {
      var game = gameModel.get(gameId);
      var users = game.$child("users");
      var keys = users.$getIndex();
      angular.forEach(keys, function(key) {
        var userRef = users.$child(key);
        userRef.$update({isTheirTurn: !userRef.isTheirTurn});
      });
    }

    gameModel.logWords = function(gameId, currentGame, sentence) {
      var gameRef = gameModel.getRef(gameId);
      var wordsUsed = gameRef.child("wordsUsed");
      var wordsToUse = currentGame.wordList;
      var wordsInSentence = sentence.split(" ");
      wordsInSentence.forEach(function(cased_word) {
        var word = cased_word.toLowerCase();
        for (var i = 0; i < wordsToUse.length; i++) {
          var wordToLookAt = wordsToUse[i].word.toLowerCase();
          if (word === wordToLookAt || word.indexOf(wordToLookAt) !== -1) {
            wordsUsed.$add(wordsToUse[i].word);
          }
        }
      });
    }
  })

;

module.exports = 'sf.services.game';
