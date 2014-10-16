var moduleName = 'sf.lobby';
var fs = require('fs');
var home = require('./../home');
var lobbyService = require('./../../common/services/lobby/');

angular.module(moduleName, [
  'ui.router'
])

.config(function($stateProvider) {
  $stateProvider
    .state(moduleName, {
      url: '/lobby?id',
      views: {
        'content@': {
          template: fs.readFileSync(__dirname + '/lobby.tpl.html'),
          controller: 'LobbyCtrl as lobby'
        }
      }
    });
})

.controller('LobbyCtrl', function($state, $scope, Lobby) {
  var lobby = this;
  var lobbyId = $state.params.id;
  if (!lobbyId) {
    $state.go(home);
    return
  }
  lobby.id = lobbyId;
  lobby.room = Lobby.connectToLobby($scope, lobbyId);
  lobby.localStudent = null;
  lobby.addStudentToRoom = function() {
    Lobby.addStudentToRoom(lobby.localStudent, lobbyId);
  };
  return lobby;
});

module.exports = moduleName;
