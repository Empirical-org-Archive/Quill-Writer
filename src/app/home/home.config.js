module.exports =

function($stateProvider) {
  $stateProvider
    .state('quill-writer.home', {
      // Parameters: uid = activity UID, student = activity session UID, form = flag to show the admin form
      url: '/{shortcode:[a-z]{0,3}}?uid&student&form',
      views: {
        'content@': {
          templateUrl: 'home.tpl.html',
          controller: 'HomeCtrl as home'
        }
      }
    });
}
