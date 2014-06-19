angular.module('stories-with-friends', [

    // features
    'sf.home',
    'sf.users',

    // common, including components and services
    'sf.common',
    'sf.constants',

    // template modules
    // templates-app
    // templates-common

    // angular modules
    // ngResource // if desired

    // third party modules
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
          'sidebar': {
            template: '<div class="well">Sidebar can go here, with lots of cool things in it.</div>'
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
