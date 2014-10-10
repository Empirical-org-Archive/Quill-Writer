var User = require('./user/');
var Game = require('./game/');
var Form = require('./form/');
var Empirical = require('./empirical/');
var ProfanityFilter = require('./profanity-filter/');
var Punctuation = require('./punctuation/');

angular.module('sf.common.services', [
    User,
    Game,
    Form,
    Empirical,
    ProfanityFilter,
    Punctuation,
  ])
;

module.exports = 'sf.common.services';
