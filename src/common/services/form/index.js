var sfConstants = require('./../../constants');
var compass = require('./../compass/');
angular.module('sf.services.form', [
  sfConstants,
  compass
])

.service("Form", function(Compass) {
  var form = this;

  form.submit = function(f, cb) {
    Compass.createActivity(f, function(err) {
      if (typeof cb === 'function') {
        cb(err);
      }
    })
  }
})
