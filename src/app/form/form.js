angular.module('sf.form', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.form', {
        url: '/form?uid',
        views: {
          'content@': {
            templateUrl: 'app/form/form.tpl.html',
            controller: 'FormCtrl as form'
          }
        }
      });
  })

  .controller('FormCtrl', function(Form) {
    var form = this;

    form.currentForm = {};

    form.submitForm = function(f) {
      Form.submit(f, function(err) {
        //do something sending the quill.js close form event thing
      });
    }
  })

;
