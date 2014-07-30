angular.module('sf.game', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.game', {
        url: '/games?uid&sid',
        resolve: {
          currentGame: function(Game, User) {
            return Game.getGameByUser(User);
          }
        },
        views: {
          'content@': {
            // TODO - use html2js template cache
            templateUrl: 'app/game/game.tpl.html',
            controller: 'GameCtrl as game'
          }
        }
      });
  })

  .controller('GameCtrl', function(Game, currentGame, User){
    var game = this;

    game.currentGame = currentGame;

    game.closeGame = function() {
      var gameId = game.currentGame.$id;
      Game.closeGame(gameId);
    };

    game.currentGame.newSentence = "";
    game.currentGame.wordsUsed = 0;

    game.submitSentence = function() {
      //do some validation here
      var sentence = String(game.currentGame.newSentence);
      Game.sendSentence(game.currentGame.$id, sentence);
      game.currentGame.newSentence = "";
      Game.takeTurns(game.currentGame.$id);
    }

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
  })

;
