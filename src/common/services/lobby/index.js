var moduleName = 'sf.services.lobby';
var serviceName = 'Lobby';

var sfConstants = require('../../constants');

angular.module(moduleName, [
  sfConstants,
])

.service(serviceName, function($firebase, baseFbUrl, $analytics) {
  var lobbyService = this;

  var lobbyRef = new Firebase(baseFbUrl + "/lobby");

  lobbyService.getRoomRef = function(lobbyId) {
    return lobbyRef.child(String(lobbyId));
  };

  lobbyService.getRoom = function(roomRef) {
    return $firebase(roomRef);
  };

  lobbyService.getRoomMembers = function(roomRef) {
    var roomMembersRef = roomRef.child("members");
    var roomMembers = $firebase(roomMembersRef).$asArray();
    return roomMembers;
  };

  lobbyService.connectToLobby = function($scope, lobbyId) {
    var roomMembers = lobbyService.getRoomMembers(lobbyService.getRoomRef(lobbyId));
    $scope.members = roomMembers;
    return $scope;
  };

  lobbyService._intializeListeners = function() {

  };

  lobbyService.addStudentToRoom = function(student, lobbyId) {
    var roomMembers = lobbyService.getRoomMembers(lobbyService.getRoomRef(lobbyId));
    roomMembers.$add(student);
  }
});

module.exports = moduleName;
