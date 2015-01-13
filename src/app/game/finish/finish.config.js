module.exports =

function($stateProvider) {
  $stateProvider
    .state('quill-writer.game.finish', {
      url: '/finish/:gameId',
      views: {
        'content@': {
          templateUrl: "finish.tpl.html",
          controller: 'FinishCtrl as finish'
        }
      }
    });
};
