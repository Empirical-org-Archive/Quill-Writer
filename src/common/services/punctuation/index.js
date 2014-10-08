var moduleName = 'sf.services.punctuation';

angular.module(moduleName, [])

.service("Punctuation", function(_) {
  var punctuation = this;

  punctuation.properPunctuationString = function(tokens) {
    var initial = _.initial(tokens);
    var last = _.last(tokens);
    return "'" + initial.join('\', \'') + '\' or \'' + last + "'";
  };

  punctuation.checkEndingPunctuation = function(sentence) {
    var errors = [];

    var tokens = sentence.split('');
    var acceptableTokens = ".;?!\")".split('');

    var containsProperEndingPunctuation = _.some(acceptableTokens, function(at) {
      return at === tokens[tokens.length - 1];
    });

    if (!containsProperEndingPunctuation) {
      errors.push("Please end your sentence with " + punctuation.properPunctuationString(acceptableTokens) + ".");
    }

    if (errors.length === 0) {
      return null;
    } else {
      return errors;
    }
  };

});

module.exports = moduleName;

