var sfConstants = require('./../../constants');
angular.module('sf.services.form', [
  sfConstants,
])

.service("Form", function(baseFbUrl ) {
  var form = this;

  form.submit = function(f, cb) {

  }
})

module.exports = 'sf.services.form';
