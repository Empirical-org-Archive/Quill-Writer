angular.module('app.components.header', [
    'app.constants'
  ])

    .directive('appHeader', function() {
      return {
        restrict: 'E',

        // TODO - use html2js template cache
        templateUrl: 'common/components/header/header.tpl.html',
        controller: 'AppHeaderCtrl as header'
      };
    })

    .controller('AppHeaderCtrl', function($rootScope, $state, appName) {
      var header = this;

      header.appName = appName;

      // grab initial state
      header.currentState = $state.current.name;

      // update current state with any subsequent state changes
      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        header.currentState = toState.name;
      });
    })
;