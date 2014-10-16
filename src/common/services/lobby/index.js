var moduleName = 'sf.services.lobby';
var serviceName = 'Lobby';

var sfConstants = require('../../constants');

angular.module(moduleName, [
  sfConstants,
])

.service(serviceName, function($firebase, baseFbUrl, $analytics) {
  var lobbyService = this;

  var lobbyRef = new Firebase(baseFbUrl, "/lobby");

});

module.exports = moduleName;
