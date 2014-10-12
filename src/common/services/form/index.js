var sfConstants = require('./../../constants');
var empirical = require('./../empirical/');
angular.module('sf.services.form', [
  sfConstants,
  empirical
])

.service("Form", function(Empirical) {
  var form = this;

  form.submit = function(f, cb) {
    Empirical.createActivity(f, function(err) {
      if (typeof cb === 'function') {
        cb(err);
      }
    })
  }
})

module.exports = 'sf.services.form';
