var sfConstants = require('./../../constants');

var moduleName = 'sf.services.empirical';
var serviceName = 'Empirical';

angular.module(moduleName, [
    sfConstants
  ])

  .service(serviceName, function($http, $q, $firebase, baseFbUrl, empiricalBaseURL, _) {
    var empirical = this;

    var staticUIDs = require('./stories.uids.json');

    var currentActivity = null;

    empirical.getUserInformation = function(userId, cb) {

    };

    empirical.getCurrentActivityData = function() {
      return currentActivity;
    }

    empirical.getWordList = function(activityId, cb) {
      var wl = empirical.getCurrentActivityData().wordList;
      if (typeof wl === "string") {
        wl = JSON.parse(wl);
      }
      cb(wl);
    };

    empirical.getStoryRequirements = function(activityId, cb) {
      empirical.getWordList(activityId, function(wordList) {
        var wordsLength = wordList.length;
        cb({needed: wordsLength < 6 ? wordsLength : 6});
      });
    };

    empirical.getPrompt = function(activityId, cb) {
      cb(empirical.getCurrentActivityData().prompt);
    };

    empirical.flagSentence = function(sentence, cb) {

    };

    empirical.submitStory = function(story, cb) {

    };

    empirical.mapUIDs = function(tryThisId) {
      if (staticUIDs[tryThisId]) {
        return staticUIDs[tryThisId];
      } else {
        return tryThisId;
      }
    }

    empirical.initializeGame = function(game, users, currentUser) {
      var sessionId = currentUser.activityPrompt;
      var activityUID = empirical.mapUIDs(sessionId);
      empirical.loadActivity(activityUID)
      .then(function() {
        empirical.getPrompt(sessionId, function(p) {
          game.prompt = p;
        });

        empirical.getWordList(sessionId, function(wordList) {
          game.wordList = wordList;
        });

        empirical.getStoryRequirements(sessionId, function(requirements) {
          game.requirements = requirements;
        });
      }, function(err){
        alert(err);
      });

    };

    var activitiesRef = new Firebase(baseFbUrl + "/activities");

    empirical.getActivity = function(activityUID) {
      return $firebase(activitiesRef.child(activityUID)).$asObject();
    };

    empirical.loadActivity = function(activityUID) {
      var activityPromise = $q.defer();

      var activity = empirical.getActivity(activityUID);

      activity.$loaded().then(function(a) {
        if (a.prompt) {
          currentActivity = a;
          activityPromise.resolve();
        } else {
          activityPromise.reject(new Error("Activity UID " + activityUID + " didn't exist"));
        }
      });

      return activityPromise.promise;
    };
    //Activity Admin Things
    empirical.createActivity = function(activity, cb) {
      console.log("submitting this activity %s", JSON.stringify(activity));
      cb();
    };

    empirical.getRandomPromptUID = function() {
      return staticUIDs[_.random(1, _.size(staticUIDs))];
    };

    empirical.getAvailablePrompts = function() {
      return $firebase(activitiesRef).$asArray();
    };

  })

;
module.exports = moduleName;
