module.exports =

angular.module('quill-writer.game.finish', [
    'ui.router',
  ])

  .config(require('./finish.config.js'))
  .controller('FinishCtrl', require('./finish.controller.js'))

;
