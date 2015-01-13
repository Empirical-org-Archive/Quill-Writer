module.exports =

function($stateProvider) {
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
};
