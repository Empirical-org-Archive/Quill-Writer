angular.module('app', [

    // features
    'app.home',
    'app.users',

    // common, including components and services
    'app.common',

    // template modules
    // templates-app
    // templates-common

    // angular modules

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
          'content': {
            template: '<div>Main Content</div>'
          },
          'footer': {
            template: '<hr><p>Footer</p>'
          }
        }
      });

  })

;
