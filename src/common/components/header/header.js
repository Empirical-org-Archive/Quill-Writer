angular.module('sf.components.header', [
    'sf.constants'
  ])

    .directive('sfHeader', function() {
      return {
        restrict: 'E',

        // TODO - use html2js template cache
        templateUrl: 'common/components/header/header.tpl.html',
        controller: 'SfHeaderCtrl as header'
      };
    })

    .controller('SfHeaderCtrl', function($rootScope, $state, appName) {
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