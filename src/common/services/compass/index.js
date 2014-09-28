var sfConstants = require('./../../constants');
angular.module('sf.services.compass', [
    sfConstants
  ])

  .service("Compass", function($http, compassBaseURL) {
    var compass = this;

    compass.getUserInformation = function(userId, cb) {

    };

    compass.getWordList = function(activityId, cb) {
      var temp_word_list = [
        {word: "Deliberate", definition: "done consciously and intentionally"},
        {word: "Triumph", definition: "a great victory or achievement"},
        {word: "Numb", definition: "deprived of the power of sensation"},
        {word: "Tether", definition: "a rope or chain with which an animal is tied to restrict its movement"},
        {word: "Prod", definition: "poke (someone) with a finger, foot, or pointed object"},
        {word: "Disclose", definition: "make (secret or new information) known"},
        {word: "Culprit", definition: "a person who is responsible for a crime or other misdeed"},
        {word: "Employed", definition: "give work to (someone) and pay them for it"},
      ];
      cb(temp_word_list);
    };

    compass.getStoryRequirements = function(activityId, cb) {
      var temp_requirements = {
        needed: 6
      };
      cb(temp_requirements);
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
      var sessionId = currentUser.sid;
      compass.getPrompt(function(p) {
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
