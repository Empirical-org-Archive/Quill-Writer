module.exports =

function(_, Game, $state, User) {
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

  finish.useColor1 = function(user) {
    return user.leader;
  }

  /**
   * Init
   */

  if ($state.params.gameId) {
    finish.game = Game.getFinishedGame($state.params.gameId);
  } else {
    console.log('going home');
    $state.go('quill-writer.home');
  }

};
