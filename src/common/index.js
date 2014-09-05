var sfComponents = require('./components/');
var sfServices = require('./services/');
angular.module('sf.common', [
    'sf.common.components',
    'sf.common.services'
  ])

;
module.exports = 'sf.common';
