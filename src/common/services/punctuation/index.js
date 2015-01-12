var punctuationModule = angular.module('quill-writer.services.punctuation', []);

/*
 * Punctuation checks that sentences have the correct ending tokens.
 * Return null, if the sentence passes all the requirements.
 * Return an array of display strings if the sentence fails the requirements.
 */
punctuationModule.service("Punctuation", function(_) {
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

module.exports = punctuationModule;

