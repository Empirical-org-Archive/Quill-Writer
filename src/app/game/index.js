var profanityFilter = require('./../../common/services/profanity-filter/');
var punctuation = require('./../../common/services/punctuation/');
var game = require('./../../common/services/game/');

var fs = require('fs');

/*
 * sf.game is a module with _a lot_ going on. We should split the individual components
 * into directives with their own controllers, services etc. Most of the action is in the game.
 * TODO This file should become a simple module that loads all of the dependent directives,
 * modules, services etc and glues them together nicely.
 */

angular.module('sf.game', [
    'ui.router',
    profanityFilter,
    punctuation,
    'ngSanitize'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.game', {
        // Parameters: uid = game UID, sid = activity session UID, activityPrompt = activity UID
        url: '/games?uid&sid&activityPrompt',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + "/game.tpl.html"),
            controller: 'GameCtrl as game'
          }
        }
      });
  })
  .controller('GameCtrl', function($scope, $state, Game, User, ProfanityFilter, Punctuation, Partner, uuid4, Link, _, ActivitySession, ConceptTagResult) {
    var game = this;

    var currentUser = User.currentUser;
    if ($state.params.uid && $state.params.sid && $state.params.activityPrompt) {
      User.setCurrentUser({
        uid: $state.params.uid,
        sid: $state.params.sid,
        activityPrompt: $state.params.activityPrompt
      });
    }
    if (!currentUser) {
      currentUser = User.getUserFromLocalStorage();
      if (currentUser) {
        User.setCurrentUser(currentUser);
      } else {
        console.log("There is no current user. Redirecting to sf.home");
        $state.go('sf.home');
        return;
      }
    }

    // FIXME: currentGame is a Scope.
    game.currentGame = Game.getGameByUser(User, $scope);

    function generatePartnerUID () {
      var puid = Partner.getPartnerUID();
      if (!puid) {
        puid = uuid4.generate();
        Partner.setPartnerUID(puid);
      }
      return puid;
    }

    if (Partner.IAmPartner()) {
      game.currentGame.partnerDivShow = false;
    } else {
      Link.generateAndShortenPartnerURL({
        partnerUID: generatePartnerUID(),
        sid: $state.params.sid,
        activityPrompt: $state.params.activityPrompt
      }).then(function(shortcode) {
        var url = window.location.origin + "/#/" + shortcode;
        game.currentGame.partnerURL = url;
      });
      game.currentGame.partnerDivShow = true;
    }

    game.currentGame.defaultTextAreaPlaceHolder = "Type your sentence here. Move your mouse pointer over the story word to see the definition.";
    game.currentGame.loadingTextAreaPlaceHolder = "Waiting for your partner to connect. Please share the link above.";
    game.currentGame.textAreaPlaceHolder = game.currentGame.loadingTextAreaPlaceHolder;

    game.getPartnerURL = function() {
      return game.currentGame.partnerURL;
    };

    game.fallback = function(copy) {
      window.prompt('Press cmd+c(Mac) or ctrl-c(Windows) to copy the text below.', copy);
    };

    game.closePartnerURLDiv = function() {
      game.currentGame.partnerDivShow = false;
    };

    game.currentGame.instructionDivShow = true;
    game.closeInstructionDiv = function() {
      game.currentGame.instructionDivShow = false;
    };

    var gameId = User.currentUser.sid;

    game.currentGame.newSentence = "";
    game.currentGame.finishMessageToShow = "";

    game.closeGame = function() {
      var gameId = game.currentGame.$id;
      Game.closeGame(gameId);
    };

    game.getCurrentSentence = function() {
      return game.currentGame.newSentence;
    }

    game.submitEntry = function() {
      //do some validation here
      var sentence = game.getCurrentSentence();
      if (sentence === "") {
        return;
      }
      var errors = game.validateSentence(sentence);
      if (errors.length === 0) {
        Game.sendSentence(gameId, game.currentGame, sentence, User.currentUser);
        Game.logWords(gameId, game.currentGame, sentence);
        Game.takeTurns(gameId);
        game.currentGame.newSentence = "";
      } else {
        game.showErrors(errors);
      }

    }

    game.validateSentence = function(sentence) {
      var errors = [];
      var profane = ProfanityFilter.checkSentence(sentence);
      if (profane) {
        errors.push(profane);
      }
      var incorrectPunctuation = Punctuation.checkEndingPunctuation(sentence);
      if (incorrectPunctuation) {
        errors.push(incorrectPunctuation);
      }
      return errors;
    };

    game.showErrors = function(errors) {
      var eString = [];
      errors.forEach(function(err) {
        err.forEach(function(errString) {
          eString.push(errString);
        });
      });

      alert(eString.join("\n"))
    };

    game.isLocalPlayersTurn = function() {
      var users = game.currentGame.users;
      if (users) {
        var userInControl;
        angular.forEach(users, function(user) {
          if (user.isTheirTurn) {
            userInControl = user;
          }
        });
        if (userInControl) {
          return userInControl.name === User.localUser;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    game.isWordUsed = function(word) {
      var wordUsed = false;
      angular.forEach(game.currentGame.wordsUsed, function(usedWord) {
        if (word === usedWord.$value) {
          wordUsed = true;
        }
      });
      return wordUsed;
    }

    game.finish = function() {
      Game.imDone(gameId, game.currentGame, User.currentUser, function onDone() {
        finishActivitySession().then(function() {
          $state.go('sf.game.finish', {
            gameId: gameId,
            uid: $state.params.uid
          });
        }).catch(function(error) {
          console.log('failed to save the activity session', error);
        });
      });
    }

    game.isReadyToSubmit = function() {
      if (game.currentGame.requirements) {
        return game.currentGame.wordsUsed.length >= game.currentGame.requirements.needed;
      } else {
        return false;
      }
    };

    game.hasFinishMessageToShow = function() {
      return game.currentGame.finishMessageToShow !== "";
    }

    game.isYou = function(user) {
      return user.name === User.localUser;
    }

    game.bothPlayersReady = false;

    Game.onBothPlayersReady(gameId, function() {
      game.bothPlayersReady = true;
      game.currentGame.textAreaPlaceHolder = game.currentGame.defaultTextAreaPlaceHolder;
      game.closePartnerURLDiv();
      Game.ensureItIsSomeonesTurn(gameId);
    });

    game.disableTextArea = function() {
      return !game.isLocalPlayersTurn() || game.hasPartnerSubmissionToReview();
    };

    /*
     * Set and save the display name for the current user.
     */
    game.setStudentName = function(name) {
      User.currentUser.displayName = name;
      _.each(game.currentGame.users, function(user) {
        if (user.uid === User.currentUser.uid) {
          user.displayName = name;
          game.currentGame.users.$save(user);
        }
      });
    };

    game.studentSetName = function() {
      if (typeof User.currentUser.displayName !== 'undefined') {
        return true;
      } else {
        var t = false;
        _.each(game.currentGame.users, function(user) {
          if (user.uid === User.currentUser.uid && typeof user.displayName !== 'undefined') {
            t = true;
          }
        });
        return t;
      }
    };

    /*
     * Review Functions and setup
     */
    game.hasPartnerSubmissionToReview = function() {
      return typeof game.sentenceToReview === 'string';
    };

    game.sentenceIsOK = function() {
      game.sentenceToReview = null;
    };

    // Returns a promise that receives the activity session response JSON from the LMS.
    function finishActivitySession() {
      var activitySessionId = User.currentUser.sid;

      // Retrieve data from firebase, format it correctly, then send it off to the LMS.
      return ConceptTagResult.findAsJsonByActivitySessionId(activitySessionId).then(function formatRequestData(resultsJson) {
        var putData = {
          concept_tag_results: resultsJson
        };
        return ActivitySession.finish(activitySessionId, putData);
      });
    }

    game.sentenceIsNotOK = function() {
      Game.flagSentenceForReview(gameId, User.currentUser, game.sentenceToReview, function() {
        game.sentenceToReview = null;
      });
    };

    Game.onOtherPlayerSubmission(gameId, User.currentUser, function(submission) {
      game.sentenceToReview = submission;
    });
  })

;

module.exports = 'sf.game';
