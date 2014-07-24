
angular.module('sf.services.form', [
  'sf.constants',
  'sf.services.compass'
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
