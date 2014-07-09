angular.module('sf.services.compass', [
    'sf.constants'
  ])

  .service("Compass", function($http, compassBaseURL) {
    var compass = this;

    compass.getUserInformation = function(userId, cb) {

    };

    compass.getWordList = function(activityId, cb) {

    };

    compass.getStoryRequirements = function(activityId, cb) {

    };

    compass.getPrompt = function(cb) {
      var temp_prompt = "You were awakened one morning by a talking parrot. \"I know where a treasure is buried,\", it squawked..."
      cb(temp_prompt);
    };

    compass.flagSentence = function(sentence, cb) {

    };

    compass.submitStory = function(story, cb) {

    };

    compass.initializeGame = function(game, users, currentUser) {
      compass.getPrompt(function(p) {
        game.prompt = p;
      });
    };

  })

;
