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

    gameModel.getGameByUser = function(User, $scope) {
      var currentUser = User.currentUser;
      var gameRef = gameModel.getRef(currentUser.sid);
      var gameUsersRef = gameRef.child("users");
      var gameUsers = $firebase(gameUsersRef).$asArray();
      gameUsers.$loaded().then(function() {
        var length = gameUsers.length;
        if (length < 2) {
          currentUser.name = "Player " + String(length + 1);
          currentUser.isTheirTurn = currentUser.name === "Player 1";
          User.localUser = currentUser.name;
          gameUsers.$add(currentUser);
        }
        Compass.initializeGame($scope, gameUsers, currentUser);
      }).then(function() {
        $scope.users = gameUsers;
      });
      var wordsUsed = $firebase(gameRef.child("wordsUsed")).$asArray();
      var sentences = $firebase(gameRef.child("sentences")).$asArray();
      var wordsUsedLength = $firebase(gameRef.child("wordsUsedLength")).$asObject();
      wordsUsedLength.$loaded(function() {
        if (!wordsUsedLength.length) {
          wordsUsedLength.length = 0;
          wordsUsedLength.$save();
        }
      });
      wordsUsed.$watch(function() {
        wordsUsedLength.$loaded(function() {
          wordsUsedLength.length = wordsUsed.length;
          wordsUsedLength.$save();
        });
      });
      $scope.wordsUsedLength = wordsUsedLength;
      $scope.wordsUsed = wordsUsed;
      $scope.sentences = sentences;
      return $scope;
    };

    gameModel.getSentences = function(gameId) {
      return $firebase(gameModel.getRef(gameId).child("sentences")).$asArray();
    }

    gameModel.closeGame = function(gameId) {
      var currentGame = $firebase(gameModel.get(gameId));
      currentGame.$update({status: 'ended'});
    };

    gameModel.sendSentence = function(gameId, currentGame, sentence, currentUser) {
      sentence = gameModel.highlightWords(gameId, currentGame, sentence);
      gameModel.getSentences(gameId).$add({entry: sentence, user: currentUser});
    };

    gameModel.highlightWords = function(gameId, currentGame, sentence) {
      var wordsToUse = currentGame.wordList;
      var wordsInSentence = sentence.split(" ");
      var returnedSentences = [];
      wordsInSentence.forEach(function(cased_word) {
        var word = cased_word.toLowerCase();
        for (var i = 0; i < wordsToUse.length; i++) {
          var wordToLookAt = wordsToUse[i].word.toLowerCase();
          if (word === wordToLookAt || word.indexOf(wordToLookAt) !== -1) {
            cased_word = "<b>" + cased_word + "</b>";
          }
        }
        returnedSentences.push(cased_word);
      });
      return returnedSentences.join(" ");
    }

    gameModel.takeTurns = function(gameId) {
      var game = gameModel.getRef(gameId);
      var users = $firebase(game.child("users")).$asArray();
      users.$loaded().then(function(){
        angular.forEach(users, function(user) {
          user.isTheirTurn = !user.isTheirTurn;
          users.$save(user);
        });
      });
    }

    gameModel.isSameUser = function(u1, u2) {
      return ((u1.sid === u2.sid) && (u1.uid === u2.uid) && (u1.name === u2.name));
    }

    gameModel.imDone = function(gameId, currentGame, currentUser) {
      var game = gameModel.getRef(gameId);
      var users = $firebase(game.child("users")).$asArray();
      users.$loaded().then(function(){
        angular.forEach(users, function(user) {
          if (gameModel.isSameUser(user, currentUser)) {
            user.done = true
            users.$save(user);
          }
        });
      });
    }

    gameModel.logWords = function(gameId, currentGame, sentence) {
      var gameRef = gameModel.getRef(gameId);
      var wordsUsed = $firebase(gameRef.child("wordsUsed")).$asArray();
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
