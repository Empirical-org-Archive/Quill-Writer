var fs = require('fs');

module.exports = angular.module('quill-writer.lobby', [
  'ui.router'
])

.config(require('./lobby.config.js'))
.controller('LobbyCtrl', require('./lobby.controller.js'));
