var DEBUG = false;
var VERBOSE = false;

//=================

if (process.argv.length != 3)
        throw "Expected parameters of name, gmail account, and password.";
var CFG =
(function () {
	var data;
	try {
		data = JSON.parse(process.argv[2]);
	} catch (e) {
		throw "Expected valid JSON as server.js parameter";
	}
	var props = ['baseUrl', 'webkey'];
	props.map(function (p) {
		if (!data.hasOwnProperty(p)) 
			throw 'Missing server.js config field "' + p + '"';
	});
	return data;
}())

var express = require('express');
var request = require("request");
var app = express();

////////

app.enable('trust proxy'); //for nginix etc..

var qs = require('querystring');
var zerorpc = require("zerorpc");
 
app.use(express.compress());
var minify = require('express-minify');
app.use(minify());

var oneHour = 86400000 / 24;
app.use(express.static(__dirname + '/public', { maxAge: oneHour }));


app.use(express.bodyParser());

app.use(express.logger({stream: process.stderr}));

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get('/api/succeed', function (req, res) { res.send({value: 'succeed', v: req.query.v}); });
app.get('/api/echo', function (req, res) { res.send({value: 'succeed', echo: req.query.v}); });
app.get('/api/fail', function (req, res) {	res.zz(); });
app.use(function(req, res, next){
  if (req.is('text/*')) {
    req.text = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ req.text += chunk });
    req.on('end', next);
  } else {
    next();
  }
});
//app.use(function(err, req, res, next) { res.send(500, 'internal server error'); })
/////// bury exns
app.use(function(err, req, res, next) {
    console.log("zomg error", t, err.stack);
    if(!err) return next(err);
    var t = new Date().getTime();
    res.send({error: "ohnoes!", t: t});
});

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

io.enable('browser client gzip');
io.set('transports', ['xhr-polling']);
console.log('Sockets defaulting to xhr-polling due to aws/nginx config issue');

if (!DEBUG || !VERBOSE) io.set('log level', 1); // reduce logging


///////

var matches = require('./match.js').init(app, io);
var lobby = require('./lobby.js').init(app, io);

///////

app.get('/api/exit', function (req, res) {
	console.log('api/exit', req.query);
	if (req.query.k == CFG.webkey) {
		res.send({msg: 'closing in 5s'});
		setTimeout(function () { 
			console.log('api exit now');
			process.exit(1); 
		}, 5 * 1000);
	} else {
		res.send({msg: 'unknown'});
	}
});

process.on('SIGINT', function () {
  console.log('sigint, exiting');
  process.exit(); 
});

process.on('exit', function () {
	console.log('exit event, shutting down');
	shutdown(function () {
		console.log('finished exit shutdown');
	});
});

function shutdown (cb) {
	console.log('shutdown main');
	matches.shutdown(function () {
	  lobby.shutdown(cb);
	});
}

process.on('uncaughtException', function (err) {
  console.log("UNCAUGHT EXCEPTION", err.stack ? err.stack : 'no stack');
});

////////////

server.listen(3000);
console.log('Listening on port 3000');
