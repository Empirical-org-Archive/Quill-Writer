module.exports =

  /*
   * The Game is service is responsible for initializing games
   */
  function Game($firebase, firebaseUrl, Empirical, _, $analytics, ConceptTagResult, TypingSpeed, User, ActivitySession, $q) {
    var gameModel = this;

    var gamesRef = new Firebase(firebaseUrl + "/games");

    gameModel.get = function(id) {
      return $firebase(gameModel.getRef(id));
    };

    gameModel.getRef = function(id) {
      return gamesRef.child(id);
    };

    /*
     * getGameByUser is essentially a init like function. It is based an
     * Angular scope and all of the firebase refs are attached to it.
     * This auto syncs current games in progress. It creates new users
     * if required. It establishes some watch functions that update the messages
     * on certain events.
     */
    gameModel.getGameByUser = function(User, $scope) {
      var currentUser = User.currentUser;
      var gameRef = gameModel.getRef(currentUser.sid);
      var gameUsersRef = gameRef.child("users");
      var gameUsers = $firebase(gameUsersRef).$asArray();
      function makeNewUser(length) {
        currentUser.name = "Player " + String(length + 1);
        currentUser.done = false;
        currentUser.isTheirTurn = currentUser.name === "Player 1";
        currentUser.leader = currentUser.name === "Player 1";
        User.localUser = currentUser.name;
        gameUsers.$add(currentUser).then(function(newUserRef) {
          gameUsers.$loaded(function() {
            var userFinishMessageToShow = $firebase(newUserRef.child("finishMessageToShow")).$asObject();
            userFinishMessageToShow.message = "";
            userFinishMessageToShow.$watch(function() {
              $scope.finishMessageToShow = userFinishMessageToShow.message;
            });
            userFinishMessageToShow.$save().then(function() {
              var newUser = gameUsers.$getRecord(newUserRef.key());
              newUser.finishMessageToShow = userFinishMessageToShow;
              gameUsers.$save(newUser);
              User.setCurrentUser(newUser);
            });
          });
        });
        User.setCurrentUser(currentUser);
      }
      function findCurrentUser() {
        return _.find(gameUsers, function(gameUser) {
          return gameModel.isSameUser(gameUser, currentUser);
        });
      }
      gameUsers.$loaded(function() {
        var length = gameUsers.length;
        var gameUser = findCurrentUser();
        if (gameUser) {
          currentUser = gameUser;
          User.localUser = currentUser.name;
        } else if (length < 2) {
          makeNewUser(length);
        }
        //We pass everything to initialize game
        //This is where the game prompts, word lists, requirements are loaded
        Empirical.initializeGame($scope, gameUsers, currentUser);
      }).then(function() {
        $scope.users = gameUsers;
      });
      var wordsUsed = $firebase(gameRef.child("wordsUsed")).$asArray();
      var sentences = $firebase(gameRef.child("sentences")).$asArray();
      var wordsUsedLength = $firebase(gameRef.child("wordsUsedLength")).$asObject();
      wordsUsedLength.$loaded(function() {
        if (!wordsUsedLength.length) {
          wordsUsedLength.length = 0;
          wordsUsedLength.$save();
        }
      });
      wordsUsed.$watch(function() {
        wordsUsedLength.$loaded(function() {
          wordsUsedLength.length = wordsUsed.length;
          wordsUsedLength.$save();
        });
      });
      $scope.wordsUsedLength = wordsUsedLength;
      $scope.wordsUsed = wordsUsed;
      $scope.sentences = sentences;
      return $scope;
    };

    //This returns a finished game for the summary page.
    gameModel.getFinishedGame = function(gameId) {
      // game should be a POJO, not a FirebaseObject, because otherwise
      // assigning FirebaseArrays as child objects sets up a race condition.
      var game = {};
      var gameRef = gameModel.getRef(gameId);
      var wordsUsed = $firebase(gameRef.child("wordsUsed")).$asArray();
      var sentences = $firebase(gameRef.child("sentences")).$asArray();
      var wordsUsedLength = $firebase(gameRef.child("wordsUsedLength")).$asObject();
      var gameUsers = $firebase(gameRef.child("users")).$asArray();
      game.wordsUsedLength = wordsUsed;
      game.sentences = sentences;
      game.wordsUsedLength = wordsUsedLength;
      game.users = gameUsers;
      game.users.$loaded().then(function() {
        var activityUID = game.users[0].activityPrompt;
        Empirical.loadFinishedGame(game, activityUID);
      });
      return game;
    };

    gameModel.getSentences = function(gameId) {
      return $firebase(gameModel.getRef(gameId).child("sentences")).$asArray();
    };

    gameModel.closeGame = function(gameId, currentUser) {

      if (currentUser.leader) {
        $analytics.eventTrack('Quill-Writer Submit Story to Teacher');
      }

      if (!User.isAnonymous) {

        finishActivitySession().then(function() {
            console.log('successfully finished the activity session');
          }).catch(function(error) {
            console.log('failed to save the activity session', error);
          });
      }
    };

    // TODO: This should probably also save the user ID (userName?) of the
    // player who wrote the sentence.
    gameModel.saveWordsPerMinute = function(sessionId) {
      return ConceptTagResult.save(sessionId, {
        concept_class: 'Typing Speed',
        concept_tag: 'Typing Speed',
        wpm: TypingSpeed.wordsPerMinute
      }).then(function() {
        TypingSpeed.reset();
        console.log('saved typing speed concept tag');
      });
    };

    gameModel.saveStoryConceptTag = function(sessionId) {
      var allSentences = $firebase(gameModel.getRef(sessionId).child('sentences')).$asArray();
      return allSentences.$loaded().then(function() {
        // Reduce the list of sentence objects into a space-delimited string.
        var story = _.map(allSentences, function(sentenceObj) {
          return sentenceObj.entry;
        }).join(' ');
        return ConceptTagResult.save(sessionId, {
          concept_class: 'Two Player Student Writing',
          concept_tag: 'Quill Writer Story',
          story: story
        }).then(function() {
          console.log('successfully saved concept tag for story', sessionId, story);
        });
      });
    };

    gameModel.sendSentence = function(gameId, currentGame, sentence, currentUser) {
      sentence = gameModel.highlightWords(gameId, currentGame, sentence);
      sentence = gameModel.appendExtraSpaceIfNeccessary(sentence);
      gameModel.getSentences(gameId).$add({entry: sentence, user: currentUser});
    };

    gameModel.appendExtraSpaceIfNeccessary = function(sentence) {
      var tokens = sentence.split('');
      if (tokens[tokens.length - 1] !== " ") {
        tokens.push(" ");
      }
      return tokens.join('');
    };

    gameModel.highlightWords = function(gameId, currentGame, sentence) {
      var wordsToUse = currentGame.wordList;
      _.each(wordsToUse, function(w) {
        var exp = new RegExp("(" + w.word + ")", "gi");
        sentence = sentence.replace(exp, '<b>$1</b>');
      });
      return sentence;
    };

    /*
     * Toggles the isTheirTurn property on each user.
     * This only works for two player games. If we ever expand to more
     * players, this logic needs to change.
     * TODO
     */
    gameModel.takeTurns = function(gameId) {
      var game = gameModel.getRef(gameId);
      var users = $firebase(game.child("users")).$asArray();
      users.$loaded().then(function(){
        angular.forEach(users, function(user) {
          user.isTheirTurn = !user.isTheirTurn;
          users.$save(user);
        });
      });
    };

    gameModel.isSameUser = function(u1, u2) {
      return ((u1.sid === u2.sid) && (u1.uid === u2.uid));
    };

    gameModel.imDone = function(gameId, currentGame, currentUser, onDone) {
      var game = gameModel.getRef(gameId);
      var users = $firebase(game.child("users")).$asArray();
      watchForFinishedGame(game, onDone);
      var savePromises = [];
      users.$loaded().then(function(){
        angular.forEach(users, function(user) {
          userSubmittedStory(user, currentUser);
          savePromises.push(users.$save(user));
        });
        return $q.all(savePromises);
      }).then(function() { // Only run this block after all the users have been saved.
        return users.$loaded();
      }).then(function() {
        var allDone = _.every(_.pluck(users, 'done')); // Done flag is set in userSubmittedStory().
        if (allDone) {
          angular.forEach(users, function(user) {
            user.finishMessageToShow.message = "You have completed this story!";
            users.$save(user);
            setGameIsDone(game);
          });
          gameModel.saveStoryConceptTag(gameId).then(function() {
            gameModel.closeGame(gameId, currentUser);
          });
        }
      });
    };

    function userSubmittedStory(user, currentUser) {
      if (gameModel.isSameUser(user, currentUser)) {
        user.done = true;
        user.finishMessageToShow.message = "You have submitted the story. Waiting for the other player to approve.";
        user.isTheirTurn = false;
      } else {
        user.finishMessageToShow.message = "The other player has voted to submit to the story. Press submit to teacher when you feel the story is complete. You may continue to use words.";
        user.isTheirTurn = true;
      }
    }

    function setGameIsDone(game) {
      var isDone = $firebase(game.child("isDone")).$asObject();
      isDone.value = true;
      isDone.$save();
    }

    // Returns a promise that receives the activity session response JSON from the LMS.
    function finishActivitySession() {
      var activitySessionId = User.currentUser.sid;

      // Retrieve data from firebase, format it correctly, then send it off to the LMS.
      return ConceptTagResult.findAsJsonByActivitySessionId(activitySessionId).then(function formatRequestData(resultsJson) {
        var putData = {
          percentage: 1,
          concept_tag_results: resultsJson
        };
        return ActivitySession.finish(activitySessionId, putData);
      });
    }


    function watchForFinishedGame(game, onDone) {
      var gameObj = $firebase(game).$asObject();
      var unwatch = gameObj.$watch(function() {
        if (gameObj.isDone) {
          onDone();
          unwatch();
        }
      });
    }

    gameModel.onBothPlayersReady = function(gameId, cb) {
      var game = gameModel.getRef(gameId);
      var users = $firebase(game.child("users")).$asArray();
      users.$loaded().then(function(){
        if (users.length >= 2) {
          cb();
        } else {
          var unwatch = users.$watch(function() {
            if (users.length >= 2) {
              cb();
              unwatch();
            }
          });
        }
      });
    };

    gameModel.onOtherPlayerSubmission = function(gameId, currentUser, cb) {
      var sentences = gameModel.getSentences(gameId);
      sentences.$watch(function(e) {
        if (e.event === "child_added") {
          var sentence = sentences.$getRecord(e.key);
          if (sentence) {
            var sUser = sentence.user;
            if (!gameModel.isSameUser(currentUser, sUser)) {
              cb(sentence.entry);
            }
          }
        }
      });
    };

    /**
     * TODO This contains logic that assumes two players.
     */
    gameModel.ensureItIsSomeonesTurn = function(gameId) {
      var game = gameModel.getRef(gameId);
      var users = $firebase(game.child("users")).$asArray();
      users.$loaded().then(function(){
        var isSomeonesTurn = false;
        _.each(users, function(u) {
          if (u.isTheirTurn) {
            isSomeonesTurn = u.isTheirTurn;
          }
        });
        if (!isSomeonesTurn) {
          var sentences = gameModel.getSentences(gameId);
          sentences.$loaded().then(function() {
            var index = 0;
            if (sentences.length > 0) {
              index = 1;
            }
            var user = users[index];
            user.isTheirTurn = true;
            users.$save(user);
          });
        }
      });
    };

    gameModel.logWords = function(gameId, currentGame, sentence) {
      var gameRef = gameModel.getRef(gameId);
      var wordsUsed = $firebase(gameRef.child("wordsUsed")).$asArray();
      var wordsToUse = currentGame.wordList;
      var wordsInSentence = sentence.split(" ");
      var wordsToAdd = [];
      var normalizedSentence = sentence.toLowerCase();
      _.each(wordsToUse, function(wordToUse) {
        var wordToUseNormalized = wordToUse.word.toLowerCase();
        var tokens = normalizedSentence.split(wordToUseNormalized);
        if (tokens.length > 1) {
          wordsToAdd.push(wordToUse.word);
        }
      });
      wordsInSentence.forEach(function(cased_word) {
        var word = cased_word.toLowerCase();
        for (var i = 0; i < wordsToUse.length; i++) {
          var wordToLookAt = wordsToUse[i].word.toLowerCase();
          if (word === wordToLookAt || word.indexOf(wordToLookAt) !== -1) {
            wordsToAdd.push(wordsToUse[i].word);
          }
        }
      });
      wordsUsed.$loaded(function() {
        var uniqueWordsToAdd = _.uniq(wordsToAdd);
        if (wordsUsed.length === 0 && uniqueWordsToAdd.length > 0) {
          $analytics.eventTrack('Quill-Writer Story Word Used', { wordUsed : uniqueWordsToAdd[0] });
        }
        _.each(uniqueWordsToAdd, function(word) {
          wordsUsed.$add(word);
        });
      });
    };

    gameModel.flagSentenceForReview = function(gameId, currentUser, sentence, cb) {
      cb();
    };
  }

;
