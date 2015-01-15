module.exports =

function($stateProvider) {
  $stateProvider
    .state('quill-writer.link', {
      // FIXME: Remove 'name' parameter from this list because the activity name is not customizable.
      // Parameters: id = activity ID, name = activity name, activitySessionUid = activity session ID
      url: '/link?id&name&activitySessionUid',
      views: {
        'content@': {
          templateUrl: 'link.tpl.html',
          controller: 'LinkCtrl as link'
        }
      }
    });
};
