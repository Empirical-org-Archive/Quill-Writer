angular.module('app', [

    // features
    'app.home',
    'app.users',

    // common, including components and services
    'app.common',
    'app.constants',

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
      .state('app', {
        abstract: true,
        views: {
          'header': {
            template: '<app-header></app-header>'
          },
          'sidebar': {
            template: '<div class="well">Sidebar can go here, with lots of cool things in it.</div>'
          },
          'content': {
            template: '<div>Main Content</div>'
          },
          'footer': {
            template: '<app-footer></app-footer>'
          }
        }
      });

  })

;
