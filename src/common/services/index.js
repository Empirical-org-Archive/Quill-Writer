var User = require('./user/');
var Game = require('./game/');
var Form = require('./form/');
var Compass = require('./compass/');
var ProfanityFilter = require('./profanity-filter/');

angular.module('sf.common.services', [
    User,
    Game,
    Form,
    Compass,
    ProfanityFilter,
  ])
;

module.exports = 'sf.common.services';
