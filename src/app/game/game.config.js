module.exports =

function($stateProvider) {
  $stateProvider
    .state('quill-writer.game', {
      // Parameters: uid = game UID, sid = activity session UID, activityPrompt = activity UID
      url: '/games?uid&sid&activityPrompt',
      views: {
        'content@': {
          templateUrl: "game.tpl.html",
          controller: 'GameCtrl as game'
        }
      }
    });
};
