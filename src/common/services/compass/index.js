var sfConstants = require('./../../constants');

angular.module('sf.services.compass', [
    sfConstants
  ])

  .service("Compass", function($http, compassBaseURL) {
    var compass = this;

    var staticWords = require('./stories.json');

    compass.getStaticActivity = function(activityId) {
      if (staticWords[activityId]) {
        return staticWords[activityId];
      } else {
        console.log("Error: %s not found, using default activity", activityId);
        return staticWords[1];
      }
    };

    compass.getUserInformation = function(userId, cb) {

    };

    compass.getWordList = function(activityId, cb) {
      cb(compass.getStaticActivity(activityId).wordList);
    };

    compass.getStoryRequirements = function(activityId, cb) {
      var activity = compass.getStaticActivity(activityId);
      var wordsLength = activity.wordList.length;
      cb({needed: wordsLength < 6 ? wordsLength : 6});
    };

    compass.getPrompt = function(activityId, cb) {
      cb(compass.getStaticActivity(activityId).prompt);
    };

    compass.flagSentence = function(sentence, cb) {

    };

    compass.submitStory = function(story, cb) {

    };

    compass.initializeGame = function(game, users, currentUser) {
      var sessionId = currentUser.activityPrompt;

      compass.getPrompt(sessionId, function(p) {
        game.prompt = p;
      });

      compass.getWordList(sessionId, function(wordList) {
        game.wordList = wordList;
      });

      compass.getStoryRequirements(sessionId, function(requirements) {
        game.requirements = requirements;
      });

    };

    //Activity Admin Things
    compass.createActivity = function(activity, cb) {
      console.log("submitting this activity %s", JSON.stringify(activity));
      cb();
    };

  })

;
module.exports = 'sf.services.compass';
