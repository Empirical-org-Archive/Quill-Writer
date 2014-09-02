angular.module('sf.services.profanity-filter', [
])

.service("ProfanityFilter", function() {
  var pFilter = this;

  pFilter.checkSentence = function(sentence) {
    console.log(sentence);
  };

})
