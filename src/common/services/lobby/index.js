var moduleName = 'sf.services.lobby';
var serviceName = 'Lobby';
var home = require('./../../../app/home/');

var sfConstants = require('../../constants');

angular.module(moduleName, [
  sfConstants,
])

.service(serviceName, function($firebase, baseFbUrl, Empirical, $analytics, _, $state) {
  var lobbyService = this;
  var lobbyRef = new Firebase(baseFbUrl + "/lobby");
  lobbyService.GROUP_SIZE = 2;

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

  lobbyService.addStudentToRoom = function(student, lobbyId) {
    var roomMembers = lobbyService.getRoomMembers(lobbyService.getRoomRef(lobbyId));
    roomMembers.$add(student);
    lobbyService.addStudentToGroup(student, lobbyId);
  };

  lobbyService.getGroupsRef = function(roomRef) {
    return roomRef.child("groups");
  };

  lobbyService.getGroups = function(roomRef) {
    return $firebase(lobbyService.getGroupsRef(roomRef)).$asArray();
  };

  lobbyService.localGroupWatcher = function(groupId, student, lobbyId) {
    console.log("Registering with the local group watcher with %s %s %s", groupId, student, lobbyId);
    var groupsRef = lobbyService.getGroupsRef(lobbyService.getRoomRef(lobbyId));
    var groupRef = groupsRef.child(groupId);
    var group = $firebase(groupRef).$asObject();
    group.$watch(function() {
      if (group.full) {
        lobbyService.startGameFor(group, student, lobbyId);
      } else {
        console.log('Group %s not full yet!', groupId);
      }
    });
  };

  lobbyService.startGameFor = function(group, student, lobbyId) {
    console.log("Starting game for %s %s %s", group.$id, student, lobbyId);
    $state.go(home, {
      uid: student.uuid,
      sid: group.$id,
      activityPrompt: group.activityPrompt
    });
  };

  lobbyService.addStudentToGroup = function(student, lobbyId) {
    var roomRef = lobbyService.getRoomRef(lobbyId);
    var groups = lobbyService.getGroups(roomRef);
    groups.$loaded().then(function(list) {
      var slotAvailable = _.findWhere(list, {full : false});
      if (slotAvailable) {
        slotAvailable.members.push(student);
        if (slotAvailable.members.length >= lobbyService.GROUP_SIZE) {
          slotAvailable.full = true;
        }
        lobbyService.localGroupWatcher(slotAvailable.$id, student, lobbyId);
        setTimeout(function() {
          groups.$save(slotAvailable);
        }, 200);
      } else {
        //need to make a new group with this student in it
        groups.$add({
          members: [student],
          full: false,
          activityPrompt: Empirical.getRandomPromptUID()
        }).then(function(ref) {
          lobbyService.localGroupWatcher(ref.name(), student, lobbyId);
        });
      }
    });
  };
});

module.exports = moduleName;
