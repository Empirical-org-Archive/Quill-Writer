var User = require('./../../common/services/user/');
var Empirical = require('./../../common/services/empirical/');
var fs = require('fs');

angular.module('sf.link', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.link', {
        url: '/link?id&name&userName',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + '/link.tpl.html'),
            controller: 'LinkCtrl as link'
          }
        }
      });
  })

  .controller('LinkCtrl', function($state, User, Empirical, _){
    var link = this;
    var id = $state.params.id;
    var name = $state.params.name;
    var userName = $state.params.userName;

    Empirical.getAvailablePrompts().$loaded().then(function(prompts) {
      prompts = _.each(prompts, function(p) {
        if (p.$id === id) {
          link.prompt = p;
          if (typeof link.prompt.wordList === 'string') {
            link.prompt.wordList = JSON.parse(link.prompt.wordList);
          }
          link.wordList = "";
          _.each(link.prompt.wordList, function(w) {
            if (link.wordList !== "") {
              link.wordList = link.wordList + ", " + w.word + "";
            } else {
              link.wordList = link.wordList + w.word;
            }
          });
          link.wordList = link.wordList + ".";
        }
      });
    });

    link.next = function(uid, sid, activityUID) {
      $state.go('sf.game', {uid: uid, sid: sid, activityPrompt: activityUID});
    };
  })

;

module.exports = 'sf.link';
