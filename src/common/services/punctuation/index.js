var moduleName = 'sf.services.punctuation';

angular.module(moduleName, [])

.service("Punctuation", function() {
  var punctuation = this;

  punctuation.checkEndingPunctuation = function(sentence) {
    console.log("checking punctuation of this sentence");
  };

});

module.exports = moduleName;

