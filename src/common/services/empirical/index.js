var sfConstants = require('./../../constants');

var moduleName = 'sf.services.empirical';
var serviceName = 'Empirical';

angular.module(moduleName, [
    sfConstants
  ])

  .service(serviceName, function($http, $q, empiricalBaseURL) {
    var empirical = this;

    var staticWords = require('./stories.json');
    var staticUIDs = require('./stories.uids.json');

    var currentActivity = null;

    empirical.getStaticActivity = function(activityId) {
      if (staticWords[activityId]) {
        return staticWords[activityId];
      } else {
        console.log("Error: %s not found, using default activity", activityId);
        return staticWords[1];
      }
    };

    empirical.getUserInformation = function(userId, cb) {

    };

    empirical.getWordList = function(activityId, cb) {
      cb(empirical.getStaticActivity(activityId).wordList);
    };

    empirical.getStoryRequirements = function(activityId, cb) {
      var activity = empirical.getStaticActivity(activityId);
      var wordsLength = activity.wordList.length;
      cb({needed: wordsLength < 6 ? wordsLength : 6});
    };

    empirical.getPrompt = function(activityId, cb) {
      cb(empirical.getStaticActivity(activityId).prompt);
    };

    empirical.flagSentence = function(sentence, cb) {

    };

    empirical.submitStory = function(story, cb) {

    };

    empirical.mapUIDs = function(tryThisId) {

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
        currentActivity = data;
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

  })

;
module.exports = moduleName;
