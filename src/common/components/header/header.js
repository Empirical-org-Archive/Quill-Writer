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

    .controller('SfHeaderCtrl', function(appName) {
      var header = this;

      header.appName = appName;
    })
;