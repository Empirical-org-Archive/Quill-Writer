var appRoot = '../../../src/';

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    MockFirebase = require('mockfirebase').MockFirebase;;

chai.use(sinonChai);

var GameCtrl = require(appRoot + 'app/game/game.controller.js'),
    User = require(appRoot + 'common/services/user/'),
    Game = require(appRoot + 'common/services/game/');

// Because Firebase is global in the app, we have to do this.
Firebase = MockFirebase;

// $scope, $state, Game, User, ProfanityFilter, Punctuation, Partner, uuid4, Link, _, ActivitySession, ConceptTagResult



describe('GameCtrl', function() {
  var $state, scope, userService, gameService;

  function initCtrl() {
    return new GameCtrl($scope, $state, gameService, userService);
  }

  beforeEach(function() {
    userService = sinon.stub(new User());
    gameService = sinon.stub(new Game());

    $scope = {};
    $state = {
      params: {},
      go: sinon.spy()
    };
  });

  describe('during initial load', function() {

    describe('when state parameters are passed in', function() {
      it('sets the current user from state parameters', function() {
        var userParams = {
          uid: 'foo',
          sid: 'bar',
          activityPrompt: 'baz'
        };
        $state.params = userParams;
        initCtrl();
        expect(userService.setCurrentUser).to.have.been.calledWith(userParams);
      });
    });

    describe('when no state params are passed in', function() {
      it('redirects to the home page', function() {
        initCtrl();
        expect(userService.setCurrentUser.notCalled).to.be.true;
        expect($state.go).to.have.been.calledWith('quill-writer.home');
      });
    });
  });
});
