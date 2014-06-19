angular.module('app.components.header', [])

    .directive('appHeader', function() {
      return {
        restrict: 'E',

        // TODO - use html2js template cache
        templateUrl: 'common/components/header/header.tpl.html',
        controller: 'AppHeaderCtrl as header'
      };
    })

    .controller('AppHeaderCtrl', function($state) {
      var header = this;
    })
;