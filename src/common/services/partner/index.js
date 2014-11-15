var sfConstants = require('./../../constants');
angular.module('sf.services.partner', [
  sfConstants,
])

.service("Partner", function(localStorageService) {
  var partner = this;
  var key = "PartnerURL";
  var puidKey = "PartnerUID";
  var partnerKey = "IAMPARTNER";
  partner.setPartnerURL = function(purl) {
    localStorageService.set(key, purl);
  }
  partner.getPartnerURL = function() {
    return localStorageService.get(key);
  }
  partner.setPartnerUID = function(puid) {
    localStorageService.set(puidKey, puid);
  }
  partner.getPartnerUID = function() {
    return localStorageService.get(puidKey);
  };
  partner.setIAmPartner = function(val) {
    localStorageService.set(partnerKey, val);
  };
  partner.IAmPartner = function() {
    return localStorageService.get(partnerKey);
  };
})

module.exports = 'sf.services.partner';
