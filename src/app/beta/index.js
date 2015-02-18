var fs = require('fs');

angular.module('sf.beta', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.beta', {
        url: '/beta',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + '/beta.html'),
            controller: 'BetaCtrl as beta'
          }
        }
      });
  })

  .controller('BetaCtrl', function($state){
    var beta = this;
    beta.next = function() {
      $state.go(require('./../link/'), {id: 1});
    };
  })

;

module.exports = 'sf.beta';
