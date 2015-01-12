module.exports = 

angular.module('quill-writer.common.services', [
    require('./user/').name,
    require('./game/').name,
    require('./form/').name,
    require('./lobby/').name,
    require('./empirical/').name,
    require('./profanity-filter/').name,
    require('./punctuation/').name,
    require('./partner/').name,
    require('./link/').name,
  ])
;