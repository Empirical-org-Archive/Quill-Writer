'use strict';
/*
 * sf.game is a module with _a lot_ going on. We should split the individual components
 * into directives with their own controllers, services etc. Most of the action is in the game.
 * TODO This file should become a simple module that loads all of the dependent directives,
 * modules, services etc and glues them together nicely.
 */

module.exports =

angular.module('quill-writer.game', [
    'ui.router',
    'ngSanitize'
  ])

  .config(require('./game.config.js'))
  .controller('GameCtrl', require('./game.controller.js'))
;
