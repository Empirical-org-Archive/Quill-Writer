var express = require('express');
var connectAssets = require('connect-assets')

var app = express();

/**
 * Middleware
 */
app.use(connectAssets());



/**
 * Get port from env if avaliable
 */
var port = process.env.PORT || 3000;

/**
 * Start server and expose as a var
 */
var server = app.listen(port, function() {
  console.log('Listing on port %d', port);
});


