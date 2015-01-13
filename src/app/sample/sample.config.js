module.exports =

function($stateProvider) {
  $stateProvider
    .state('quill-writer.sample', {
      url: '/sample',
      views: {
        'content@': {
          templateUrl: 'sample.tpl.html',
          controller: 'SampleCtrl as sample'
        }
      }
    });
};
