angular.module('sf.game', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.game', {
        url: '/games/:id',
        resolve: {
          currentGame: function(Game, $stateParams) {
            return Game.get($stateParams.id);
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

  .controller('GameCtrl', function(Game, currentGame){
    var game = this;

    game.currentGame = currentGame;

    game.closeGame = function() {
      var gameId = game.currentGame.$id;
      Game.closeGame(gameId);
    };
  })

;
