var sfConstants = require('./../../constants');

var moduleName = 'sf.services.empirical';
var serviceName = 'Empirical';

angular.module(moduleName, [
    sfConstants
  ])

  .service(serviceName, function($http, $q, empiricalBaseURL, _) {
    var empirical = this;

    var staticUIDs = require('./stories.uids.json');

    var currentActivity = null;

    empirical.getUserInformation = function(userId, cb) {

    };

    empirical.getCurrentActivityData = function() {
      return currentActivity.data;
    }

    empirical.getWordList = function(activityId, cb) {
      cb(JSON.parse(empirical.getCurrentActivityData().wordList));
    };

    empirical.getStoryRequirements = function(activityId, cb) {
      var activity = empirical.getCurrentActivityData();
      var wordsLength = activity.wordList.length;
      cb({needed: wordsLength < 6 ? wordsLength : 6});
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
      });

    };

    empirical.loadActivity = function(activityUID) {
      var activityPromise = $q.defer();

      $http.get(empiricalBaseURL + '/activities/' + activityUID)
      .success(function(data) {
        currentActivity = data.activity;
        activityPromise.resolve();
      })
      .error(function(data) {
        activityPromise.reject(data);
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

  })

;
module.exports = moduleName;
