var fs = require('fs');

angular.module('sf.form', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.form', {
        url: '/form?uid',
        views: {
          'content@': {
            templateUrl: 'form.tpl.html',
            controller: 'FormCtrl as form'
          }
        }
      });
  })

  .controller('FormCtrl', function($state, Form, Empirical) {
    var form = this;

    var activityUID = $state.params.uid;
    var activity = Empirical.getActivity(activityUID);
    activity.$loaded().then(function(a) {
      // If the activity exists, load the values for current form.
      if (a.prompt) {
        form.currentForm = {
          name: a.name,
          prompt: a.prompt,
          requirements: a.requirements,
          subject: a.subject,
          wordList: a.wordList
        }; 
      } else {
        console.log('activity was not found');
        form.currentForm = {};

        //Initialize the empty word list
        form.currentForm.wordList = [{}];        
      }
    });


    form.submitForm = function(f) {
      Form.submit(activityUID, f, function(err, refName) {
        //do something sending the quill.js close form event thing
        if (err) {
          form.message = err;
        } else {
          form.link = "https://quill-writer.firebaseapp.com/#/myactivity/" + refName;
          if (!$state.data) {
            $state.data = {}
          }
          $state.data.link = form.link;
          $state.transitionTo('sf.form.link');
        }
      });
    }

    form.addNewWord = function() {
      form.currentForm.wordList.push({})
    }

    form.removeWord = function(wordTup) {
      var index = form.currentForm.wordList.indexOf(wordTup);
      form.currentForm.wordList.splice(index, 1);
    }

    Empirical.getGroupedByPublicPromptsAndSubject().then(function(prompts) {
      form.subjects = _.keys(prompts);
    });

  })

;

module.exports = 'sf.form';
