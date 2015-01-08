var moduleName = 'quill-writer.services.link';

angular.module(moduleName, [])

/*
 * The link service provides methods to save a partner game in Firebase,
 * generate a valid unused 3 character shortcode (easy to type in if necessary)
 * and delete the shortcode once that particular game is loaded.
 */

.service("Link", function($q, $firebase, baseFbUrl) {
  var link = this;
  var ref = new Firebase(baseFbUrl + "/shortLinks");

  function genId(len, charSet) {
    charSet = charSet || 'abcdefghijklmnopqrstuvwxyz';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
  }

  function genIdAndCheck(len, links) {
    var potentialId = genId(len);
    while(typeof links[potentialId] !== 'undefined') {
      potentialId = genId(len);
    }
    return potentialId;
  }

  link.generateAndShortenPartnerURL = function(params) {
    var deferred = $q.defer();
    var links = $firebase(ref).$asObject();
    links.$loaded().then(function() {
      var potentialId = genIdAndCheck(3, links);
      links[potentialId] = params;
      links.$save().then(function() {
        deferred.resolve(potentialId);
      })
    });
    return deferred.promise;
  };

  link.mapShortcode = function(shortcode) {
    var deferred = $q.defer();
    var links = $firebase(ref).$asObject();
    links.$loaded().then(function() {
      if (typeof links[shortcode] !== 'undefined') {
        deferred.resolve(links[shortcode]);
      } else {
        deferred.reject();
      }
    });
    return deferred.promise;
  }

  link.removeShortCodeMapping = function(shortcode) {
    var links = $firebase(ref).$asObject();
    links.$loaded().then(function() {
      if (links[shortcode]) {
        delete links[shortcode];
        links.$save();
      }
    });
  }
});

module.exports = moduleName;

