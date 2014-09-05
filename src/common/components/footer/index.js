var sfConstants = require('./../../constants');

var fs = require('fs');

angular.module('sf.components.footer', [
    sfConstants,
  ])

    .directive('sfFooter', function() {
      return {
        restrict: 'E',

        template: fs.readFileSync(__dirname + '/footer.tpl.html'),
        controller: 'SfFooterCtrl as footer'
      };
    })

    .controller('SfFooterCtrl', function(appName) {
      var footer = this;

      footer.appName = appName;
    })
;

module.exports = 'sf.components.footer';
