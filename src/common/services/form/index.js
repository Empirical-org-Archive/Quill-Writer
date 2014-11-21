var sfConstants = require('./../../constants');
angular.module('sf.services.form', [
  sfConstants,
])

.service("Form", function(baseFbUrl, $firebase ) {
  var form = this;

  var activitesRef = new Firebase(baseFbUrl + "/activities");

  form.submit = function(f, cb) {
    var activities = $firebase(activitesRef).$asArray();
    activities.$add(f).then(function(ref) {
      console.log(ref.name());
      cb(null, ref.name());
    });
  }
})

module.exports = 'sf.services.form';
