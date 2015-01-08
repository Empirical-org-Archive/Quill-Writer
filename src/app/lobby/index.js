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
          templateUrl: 'lobby.tpl.html',
          controller: 'LobbyCtrl as lobby'
        }
      }
    });
})

.controller('LobbyCtrl', function($state, $scope, Lobby, uuid4) {
  var lobby = this;
  var lobbyId = $state.params.id;
  var lobbyName = $state.params.name;
  if (!lobbyId) {
    $state.go(home);
    return;
  }
  lobby.id = lobbyId;
  lobby.name = lobbyName;
  lobby.room = Lobby.connectToLobby($scope, lobbyId);
  lobby.localStudent = {};

  lobby.addStudentToRoom = function() {
    lobby.localStudent.uuid = uuid4.generate();
    Lobby.addStudentToRoom(lobby.localStudent, lobbyId);
    lobby.localStudent.added = true;
  };

  if ($state.params.userName) {
    lobby.localStudent.name = $state.params.userName;
    lobby.addStudentToRoom();
    lobby.message = "Thanks " + lobby.localStudent.name + ". You will be joined by your partner soon.";
  }
  return lobby;
});

module.exports = moduleName;
