var sfHome = require('./home/home.js')
var sfGame = require('./game/game.js')
var sfForm = require('./form/form.js')
var sfCommon = require('./../common/common.js');
var sfConstants = require('./../common/constants.js');

angular.module('stories-with-friends', [

    // features
    sfHome,
    sfGame,

    // admin features
    sfForm,

    // common, including components and services
    sfCommon,
    sfConstants,

    // template modules
    // templates-app
    // templates-common

    // angular modules
    // ngResource // if desired

    // third party modules
    // These will not be browserified
    'firebase',
    'ui.bootstrap',
    'ui.router'
  ])

  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('sf', {
        abstract: true,
        views: {
          'header': {
            template: '<sf-header></sf-header>'
          },
          'content': {
            template: '<div>Main Content</div>'
          },
          'footer': {
            template: '<sf-footer></sf-footer>'
          }
        }
      });

  })

;
