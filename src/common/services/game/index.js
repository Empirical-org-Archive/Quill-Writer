var sfConstants = require('../../constants');
var sfCompass = require('../compass');
angular.module("sf.services.game", [
    sfConstants,
    sfCompass,
  ])

  .service("Game", function($firebase, baseFbUrl, Compass, _) {
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
      function makeNewUser(length) {
        currentUser.name = "Player " + String(length + 1);
        currentUser.done = false;
        currentUser.isTheirTurn = currentUser.name === "Player 1";
        User.localUser = currentUser.name;
        gameUsers.$add(currentUser).then(function(newUserRef) {
          gameUsers.$loaded(function() {
            var userFinishMessageToShow = $firebase(newUserRef.child("finishMessageToShow")).$asObject();
            userFinishMessageToShow.message = "";
            userFinishMessageToShow.$watch(function() {
              $scope.finishMessageToShow = userFinishMessageToShow.message;
            });
            userFinishMessageToShow.$save().then(function() {
              var newUser = gameUsers.$getRecord(newUserRef.name());
              newUser.finishMessageToShow = userFinishMessageToShow;
              gameUsers.$save(newUser);
              User.setCurrentUser(newUser);
            })
          });
        });
        User.setCurrentUser(currentUser);
      }
      function findCurrentUser() {
        var localUser = currentUser;
        var returnUser = null;
        _.each(gameUsers, function(gameUser) {
          if (gameModel.isSameUser(gameUser, localUser)) {
            returnUser = gameUser;
          }
        });
        return returnUser;
      }
      gameUsers.$loaded(function() {
        var length = gameUsers.length;
        var gameUser = findCurrentUser();
        if (gameUser) {
          currentUser = gameUser;
          User.localUser = currentUser.name;
        } else if (length < 2) {
          makeNewUser(length)
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
      console.log("Close game %s", gameId);
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
            user.finishMessageToShow.message = "You have submitted the story. Waiting for the other player to approve.";
          } else {
            user.finishMessageToShow.message = "The other player has voted to submit to the story. Press submit to teacher when you feel the story is complete. You may continue to use words.";
          }
          users.$save(user).then(function() {
            users.$loaded().then(function() {
              var allDone = true;
              angular.forEach(users, function(user) {
                if (allDone && !user.done) {
                  allDone = false;
                }
              });
              if (allDone) {
                angular.forEach(users, function(user) {
                  user.finishMessageToShow.message = "You have completed this story!";
                  users.$save(user);
                });
                gameModel.closeGame();
              }
            });
          });
        });
      });
    }

    gameModel.logWords = function(gameId, currentGame, sentence) {
      var gameRef = gameModel.getRef(gameId);
      var wordsUsed = $firebase(gameRef.child("wordsUsed")).$asArray();
      var wordsToUse = currentGame.wordList;
      var wordsInSentence = sentence.split(" ");
      var wordsToAdd = [];
      wordsInSentence.forEach(function(cased_word) {
        var word = cased_word.toLowerCase();
        for (var i = 0; i < wordsToUse.length; i++) {
          var wordToLookAt = wordsToUse[i].word.toLowerCase();
          if (word === wordToLookAt || word.indexOf(wordToLookAt) !== -1) {
            wordsToAdd.push(wordsToUse[i].word);
          }
        }
      });
      _.each(_.uniq(wordsToAdd), function(word) {
        wordsUsed.$add(word);
      });
    }
  })

;

module.exports = 'sf.services.game';
