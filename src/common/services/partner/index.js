var sfConstants = require('./../../constants');
angular.module('quill-writer.services.partner', [
  sfConstants,
])

/*
 * This Partner service provides convenience methods to
 * store things into local storage.
 */
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
    var sv = localStorageService.get(partnerKey);
    return sv === 'true';
  };
})

module.exports = 'quill-writer.services.partner';
