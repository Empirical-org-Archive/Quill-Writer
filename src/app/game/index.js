var profanityFilter = require('./../../common/services/profanity-filter/');
var game = require('./../../common/services/game/');

var fs = require('fs');

angular.module('sf.game', [
    'ui.router',
    profanityFilter
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.game', {
        url: '/games?uid&sid',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + "/game.tpl.html"),
            controller: 'GameCtrl as game'
          }
        }
      });
  })

  .controller('GameCtrl', function($scope, Game, User, ProfanityFilter){
    var game = this;

    game.currentGame = Game.getGameByUser(User, $scope);

    var gameId = User.currentUser.sid;

    game.currentGame.newSentence = "";

    game.closeGame = function() {
      var gameId = game.currentGame.$id;
      Game.closeGame(gameId);
    };

    game.getCurrentSentence = function() {
      return game.currentGame.newSentence;
    }

    game.submitEntry = function() {
      //do some validation here
      var sentence = game.getCurrentSentence();
      var errors = game.validateSentence(sentence);
      if (errors.length === 0) {
        console.log(game.currentGame.wordList);
        Game.sendSentence(gameId, sentence, User.currentUser);
        Game.logWords(gameId, game.currentGame, sentence);
        Game.takeTurns(gameId);
        game.currentGame.newSentence = "";
      } else {
        game.showErrors(errors);
      }

    }

    game.validateSentence = function(sentence) {
      var errors = [];
      var profane = ProfanityFilter.checkSentence(sentence);
      if (profane) {
        errors.push(profane);
      }
      return errors;
    };

    game.showErrors = function(errors) {
      var eString = [];
      errors.forEach(function(err) {
        err.forEach(function(errString) {
          eString.push(errString);
        });
      });

      alert(eString.join("\n"))
    };

    game.isLocalPlayersTurn = function() {
      var users = game.currentGame.users;
      if (users) {
        var userInControl;
        angular.forEach(users, function(user) {
          if (user.isTheirTurn) {
            userInControl = user;
          }
        });
        if (userInControl) {
          return userInControl.name === User.localUser;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    game.isWordUsed = function(word) {
      var wordUsed = false;
      angular.forEach(game.currentGame.wordsUsed, function(usedWord) {
        if (word === usedWord.$value) {
          wordUsed = true;
        }
      });
      return wordUsed;
    }
  })

;

module.exports = 'sf.game';
