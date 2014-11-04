var User = require('./../../common/services/user/');
var Empirical = require('./../../common/services/empirical/');
var fs = require('fs');

angular.module('sf.myactivity', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.myactivity', {
        url: '/myactivity/:id',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + '/myactivity.tpl.html'),
            controller: 'MyactivityCtrl as myactivity'
          }
        }
      });
  })

  .controller('MyactivityCtrl', function($state, User, Empirical){
    var myactivity = this;
    var id = $state.params.id;

    var activity = Empirical.getActivity(id);
    activity.$loaded().then(function(a) {
      myactivity.activity = a;
    });

    myactivity.next = function(un) {
      $state.go('sf.link', {id: id, name: myactivity.activity.name, userName: un});
    };
  })

;

module.exports = 'sf.myactivity';
