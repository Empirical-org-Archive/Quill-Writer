var User = require('./../../common/services/user/');
var fs = require('fs');

angular.module('sf.home', [
    'ui.router'
  ])

  .config(function($stateProvider) {
    $stateProvider
      .state('sf.home', {
        url: '/{shortcode:[a-z]{0,3}}?uid&sid&activityPrompt',
        views: {
          'content@': {
            template: fs.readFileSync(__dirname + '/home.tpl.html'),
            controller: 'HomeCtrl as home'
          }
        }
      });
  })

  .controller('HomeCtrl', function($state, User, Link, Partner, Empirical, _){
    var home = this;

    home.setUser = function(user) {
      User.setCurrentUser(user);
      $state.go('sf.game');
    };

    function continueWithValidSession() {
      if ($state.params.uid && $state.params.sid && $state.params.activityPrompt) {
        home.setUser({
          uid: $state.params.uid,
          sid: $state.params.sid,
          activityPrompt: $state.params.activityPrompt
        });
      } else {
        var user = User.getUserFromLocalStorage();
        if (user) {
          home.setUser(user);
        }
      }
    }

    home.trySampleActivity = function() {
      $state.go('sf.sample');
    };

    home.createNewActivity = function() {
      $state.go('sf.form');
    };

    if (typeof $state.params.shortcode !== 'undefined' && $state.params.shortcode !== "") {
      var shortcode = $state.params.shortcode;
      Link.mapShortcode(shortcode)
      .then(function(params) {
        Partner.setIAmPartner(true);
        $state.go('sf.game', {
          sid: params.sid,
          uid: params.partnerUID,
          activityPrompt: params.activityPrompt
        });
        Link.removeShortCodeMapping(shortcode);
      }, function() {
        console.log('shortcode not found');
      });
    } else {
      runActivityLoader();
    }

    function runActivityLoader() {
      Empirical.getGroupedByPublicPromptsAndSubject().then(function(prompts) {
        home.prompts = prompts;
        home.subjects = _.keys(prompts);
      });
    }

    home.changeSubject = function(subject) {
      console.log("show this subject %s", subject);
    };
  })

;

module.exports = 'sf.home';
