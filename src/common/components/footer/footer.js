angular.module('app.components.footer', [
    'app.constants'
  ])

    .directive('appFooter', function() {
      return {
        restrict: 'E',

        // TODO - use html2js template cache
        templateUrl: 'common/components/footer/footer.tpl.html',
        controller: 'AppFooterCtrl as footer'
      };
    })

    .controller('AppFooterCtrl', function(appName) {
      var footer = this;

      footer.appName = appName;
    })
;