angular.module('sf.services.compass', [
    'sf.constants'
  ])

  .service("Compass", function($http, compassBaseURL) {
    var compass = this;

    compass.getUserInformation = function(userId, cb) {

    };

    compass.getWordList = function(activityId, cb) {
      var temp_word_list = [
        {word: "Deliberate", definition: "..."},
        {word: "Triumpth", definition: "..."},
        {word: "Numb", definition: "..."},
        {word: "Tether", definition: "..."},
        {word: "Prod", definition: "..."},
        {word: "Disclose", definition: "..."},
        {word: "Culprit", definition: "..."},
        {word: "Employed", definition: "..."},
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

  })

;
