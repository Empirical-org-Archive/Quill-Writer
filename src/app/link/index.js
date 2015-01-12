var User = require('./../../common/services/user/');
var Empirical = require('./../../common/services/empirical/');

angular.module('quill-writer.link', [
    'ui.router'
  ])

  .config(function($stateProvider) {
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
  })

  .controller('LinkCtrl', function($state, User, Empirical, _, uuid4, Partner){
    var link = this;
    var id = $state.params.id;
    var name = $state.params.name;

    // This has the side effect of setting the User.isAnonymous flag if 
    // it needs to generate a random session ID.
    function getSessionId() {
      if ($state.params.activitySessionUid) {
        User.isAnonymous = false;
        return $state.params.activitySessionUid;
      } else {
        User.isAnonymous = true;
        return uuid4.generate();
      }
    }

    // IMPORTANT: This session ID may be randomly generated if the 
    // user has not started the game via the LMS.
    var sid = getSessionId();

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
      $state.go('quill-writer.game', {uid: uid, sid: sid, activityPrompt: activityUID});
    };

    link.next();
    Partner.setIAmPartner(false);
  })

;

module.exports = 'quill-writer.link';
