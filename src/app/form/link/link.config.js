module.exports =

function($stateProvider) {
  $stateProvider
    .state('quill-writer.form.link', {
      url: '/link',
      views: {
        'content@': {
          templateUrl: 'link.tpl.html',
          controller: 'FormLinkCtrl as formLink'
        }
      }
    });
};
