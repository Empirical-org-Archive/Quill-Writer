var sfConstants = require('./../../constants');
var fs = require('fs');

angular.module('sf.components.header', [
    sfConstants,
  ])

    .directive('sfHeader', function() {
      return {
        restrict: 'E',

        template: fs.readFileSync(__dirname + '/header.tpl.html'),
        controller: 'SfHeaderCtrl as header'
      };
    })

    .controller('SfHeaderCtrl', function(appName, tagLine) {
      var header = this;

      header.appName = appName;
      header.tagLine = tagLine;
    })
;

module.exports = 'sf.components.header';
