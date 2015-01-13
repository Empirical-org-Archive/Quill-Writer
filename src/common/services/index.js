module.exports =

angular.module('quill-writer.common.services', [])

  .service('User', require('./user/'))
  .service('Game', require('./game/'))
  .service('Form', require('./form/'))
  .service('Lobby', require('./lobby/'))
  .service('Empirical', require('./empirical/'))
  .service('ProfanityFilter', require('./profanity-filter/'))
  .service('Punctuation', require('./punctuation/'))
  .service('Partner', require('./partner/'))
  .service('Link', require('./link/'))
;
