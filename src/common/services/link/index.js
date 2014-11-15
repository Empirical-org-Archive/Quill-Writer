var moduleName = 'sf.services.link';

angular.module(moduleName, [])

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


  link.generateAndShortenPartnerURL = function(params) {
    var deferred = $q.defer();
    var potentialId = genId(3);
    var links = $firebase(ref).$asObject();
    links.$loaded().then(function() {
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
});

module.exports = moduleName;

