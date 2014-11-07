var sfConstants = require('./../../constants');
angular.module('sf.services.partner', [
  sfConstants,
])

.service("Partner", function(localStorageService) {
  var partner = this;
  var key = "PartnerURL";
  partner.setPartnerURL = function(purl) {
    localStorageService.set(key, purl);
  }
  partner.getPartnerURL = function() {
    return localStorageService.get(key);
  }

})

module.exports = 'sf.services.partner';
