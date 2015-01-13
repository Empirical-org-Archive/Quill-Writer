module.exports =

function($stateProvider) {
  $stateProvider
    .state('quill-writer.lobby', {
      url: '/lobby?id&name&userName',
      views: {
        'content@': {
          templateUrl: 'lobby.tpl.html',
          controller: 'LobbyCtrl as lobby'
        }
      }
    });
}
