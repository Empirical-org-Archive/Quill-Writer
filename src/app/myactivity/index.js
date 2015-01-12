module.exports = 

angular.module('quill-writer.myactivity', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('quill-writer.myactivity', {
        url: '/myactivity/:id',
        views: {
          'content@': {
            templateUrl: 'myactivity.tpl.html',
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
      $state.go('quill-writer.link', {id: id, name: myactivity.activity.name, userName: un});
    };
  })

;