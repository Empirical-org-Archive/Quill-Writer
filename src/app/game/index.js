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

    game.currentGame.sentenceModel = "";
    game.currentGame.oldSentenceModel = "";

    game.closeGame = function() {
      var gameId = game.currentGame.$id;
      Game.closeGame(gameId);
    };

    game.getCurrentSentence = function() {
      return game.currentGame.sentenceModel;
    }

    game.submitEntry = function() {
      //do some validation here
      var sentence = game.getCurrentSentence();
      var errors = game.validateSentence(sentence);
      if (errors.length === 0) {
        Game.sendSentence(gameId, sentence);
        Game.logWords(gameId, game.currentGame, sentence);
        Game.takeTurns(gameId);
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
        for (var i in users) {
          if (users[i].isTheirTurn) {
            userInControl = users[i];
            break;
          }
        }
        return userInControl.name === User.localUser;
      }
      return false;
    }

    game.isWordUsed = function(word) {
      for (var i in game.currentGame.wordsUsed) {
        if (word === game.currentGame.wordsUsed[i]) {
          return true;
        }
      }
      return false;
    }
  })

;

module.exports = 'sf.game';
