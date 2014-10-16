var moduleName = 'sf.services.lobby';
var serviceName = 'Lobby';

var sfConstants = require('../../constants');

angular.module(moduleName, [
  sfConstants,
])

.service(serviceName, function($firebase, baseFbUrl, $analytics) {
  var lobbyService = this;

  var lobbyRef = new Firebase(baseFbUrl, "/lobby");

  lobbyService.getRoomRef = function(lobbyId) {
    return lobbyRef.child(lobbyId);
  };

  lobbyService.getRoom = function(roomRef) {
    return $firebase(roomRef);
  };

  lobbyService.getRoomMembers = function(roomRef) {
    var roomMembersRef = roomRef.child("members");
    var roomMembers = $firebase(roomMembersRef).$asArray();
    return roomMembers;
  };

  lobbyService.connectToLobby = function($scope, lobby) {
    var roomMembers = lobbyService.getRoomMembers(lobbyService.getRoomRef(lobby.id));
    $scope.members = roomMembers;
    return $scope;
  };

  lobbyService._intializeListeners = function() {

  };

  lobbyService.addUserIdToRoom = function(id, lobby) {
    var roomMembers = lobbyService.getRoomMembers(lobbyService.getRoomRef(lobby.id));
    roomMembers.$add(id);
  }
});

module.exports = moduleName;
