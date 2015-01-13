module.exports =

function($stateProvider) {
  $stateProvider
    .state('quill-writer.form', {
      url: '/form?uid',
      views: {
        'content@': {
          templateUrl: 'form.tpl.html',
          controller: 'FormCtrl as form'
        }
      }
    });
};
