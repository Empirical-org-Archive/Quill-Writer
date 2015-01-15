module.exports =

function($state, $scope, Lobby, uuid4) {
  var lobby = this;
  var lobbyId = $state.params.id;
  var lobbyName = $state.params.name;
  if (!lobbyId) {
    $state.go('quill-writer.home');
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
};
