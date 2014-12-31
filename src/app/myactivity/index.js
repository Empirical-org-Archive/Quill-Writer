var User = require('./../../common/services/user/');
var Empirical = require('./../../common/services/empirical/');
var fs = require('fs');

// FIXME: Remove this (and template). There is no longer a need to share 
// links to the activity, activity should only be started via the LMS.
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
      // FIXME: userName field appears to be unused in LinkCtrl.
      $state.go('sf.link', {id: id, name: myactivity.activity.name, userName: un});
    };
  })

;

module.exports = 'sf.myactivity';
