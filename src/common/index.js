var sfComponents = require('./components/');
var sfServices = require('./services/');
angular.module('sf.common', [
    sfComponents,
    sfServices
  ])

;
module.exports = 'sf.common';
