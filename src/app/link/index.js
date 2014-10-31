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

  .controller('LinkCtrl', function($state, User, Empirical, _, uuid4){
    var link = this;
    var id = $state.params.id;
    var name = $state.params.name;
    var userName = $state.params.userName;

    var sid = uuid4.generate();

    Empirical.getAvailablePrompts().$loaded().then(function(prompts) {
      prompts = _.each(prompts, function(p) {
        if (p.$id === id) {
          link.prompt = p;
          if (!link.prompt.name) {
            link.prompt.name = name;
          }
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

    link.next = function() {
      var uid = uuid4.generate();
      link.stateChange(uid, sid, id);
    }

    link.stateChange = function(uid, sid, activityUID) {
      $state.go('sf.game', {uid: uid, sid: sid, activityPrompt: activityUID});
    };

    link.generatePartnerLink = function(sid, activityUID) {
      var uid = uuid4.generate();
      return "https://quill-writer.firebaseapp.com/#/games?uid=" + uid + "&sid=" + sid + "&activityPrompt=" + activityUID;
    };

    link.partnerLink = link.generatePartnerLink(sid, id);
  })

;

module.exports = 'sf.link';
