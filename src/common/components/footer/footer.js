angular.module('sf.components.footer', [
    'sf.constants'
  ])

    .directive('sfFooter', function() {
      return {
        restrict: 'E',

        // TODO - use html2js template cache
        templateUrl: 'common/components/footer/footer.tpl.html',
        controller: 'SfFooterCtrl as footer'
      };
    })

    .controller('SfFooterCtrl', function(appName) {
      var footer = this;

      footer.appName = appName;
    })
;