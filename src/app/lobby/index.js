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
      url: '/lobby?id&name&userName',
      views: {
        'content@': {
          template: fs.readFileSync(__dirname + '/lobby.tpl.html'),
          controller: 'LobbyCtrl as lobby'
        }
      }
    });
})

.controller('LobbyCtrl', function($state, $scope, Lobby, uuid4) {
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
    lobby.localStudent.uuid = uuid4.generate();
    Lobby.addStudentToRoom(lobby.localStudent, lobbyId);
    lobby.localStudent.added = true;
  };
  return lobby;
});

module.exports = moduleName;
