var fs = require('fs');

angular.module('sf.game.finish', [
    'ui.router',
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.game.finish', {
        url: '/finish/:gameId',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + "/finish.tpl.html"),
            controller: 'FinishCtrl as finish'
          }
        }
      });
  })
  .controller('FinishCtrl', function(_, Game, $state, User) {
    var finish = this;
    finish.isWordUsed = function(word) {
      var wordUsed = false;
      _.each(finish.game.wordsUsed, function(usedWord) {
        if (word === usedWord.$value) {
          wordUsed = true;
        }
      });
      return wordUsed;
    }

    finish.isYou = function(user) {
      return user.name === User.localUser;
    }

    /**
     * Init
     */

    if ($state.params.gameId) {
      finish.game = Game.getFinishedGame($state.params.gameId);
    } else {
      console.log('going home');
      $state.go('sf.home');
    }

  })

;

module.exports = 'sf.game.finish';
