var request = require("request");
var crypto = require('crypto');
var util = require('util');
var fs = require('fs');

var SLUG_LEN = 5;

var STORE = {
	filename: 'lobby.json',
	bind: function (id, def) { 
		if (!STORE.data[id]) {
			def.id = id;
			STORE.data[id] = def;
		}
		global[id] = STORE.data[id];
		return STORE.data[id]; 
	},
	flush: function (cb) {
		console.log('flushing game state');
		console.log('real', {wants: wantsAsync ? wantsAsync.length : 0, recent: recentAsync ? recentAsync.length : 0});
		try {
			fs.writeFileSync(STORE.filename, 
				JSON.stringify(STORE.data,
					function (k, v) {
						if (k == 'socket') return ''; //discard
						else return v;
					}));				
		} catch (e) {
			return cb(e);
		}
		return cb();		
	},
	data: {}
}
try {
	console.log('reloading party');
	STORE.data = JSON.parse(fs.readFileSync(STORE.filename,  'utf8'));
	console.log('loaded', STORE.data);
	for (var i in STORE.data) //JSON loses IDs otherwise
		STORE.data[i].id = i;
} catch (e) {
	console.log('could not load party, restarting from scratch');
}
setInterval(function () { //backup every 5 min
	STORE.flush(function (err) {
		console.log('game state backup', err ? 'failed' : 'succeeded', err);
	});
}, 5 * 60 * 1000);	

//persistent global state
var reloads = 
	[
		['wantsMatch', {}],
		['wantsAsync', []],
		['recentAsync', []],
		['handshakes', {}],
		['games', {}]
	];
function init(app, io, sendMandrill, db) {
	reloads.forEach(function (p) {
			STORE.bind(p[0], p[1]);
		});	
	console.log('wantsAsync', global.wantsAsync, wantsAsync);

	var adminSockets = [];
	var playerSockets = {};
	io.sockets
		.on('connection', function (socket) {	
			socket.connected = true;
			console.log('connected', socket.id);

			socket.once('getPIDLobby', function (msg, fn) {
			    console.log('connecting lobby...', msg, fn ? true : false);
			    if (!socket) {
			      console.error('no socket..');
			      return;
			    }
				if (msg.playerID && msg.playerID != 'undefined') {
					console.log('connecting', 'existing PID', msg, socket ? true : false);
					console.log('lobby');
					socket.playerID = msg.playerID;
					playerSockets[msg.playerID] = socket;
					return fn(msg.playerID);
				} else {
					crypto.randomBytes(SLUG_LEN, function(ex, buf) {						
						var slug = buf.toString('hex');
						console.log('connecting', 'gensym PID', slug);
						socket.playerID = slug;
						playerSockets[slug] = socket;						
						fn(slug);
					});
				}
			
			});

			lobby(socket, db);
			join(socket);
			
			socket.on('disconnect', function () {
				socket.connected = false;
				if (socket.playerID && playerSockets[socket.playerID])
					delete playerSockets[socket.playerID];
				if (adminSockets.indexOf(socket) != -1)
					adminSockets.splice(adminSockets.indexOf(socket), 1);
				console.log('disconnected', socket.playerID, socket.id);
			});
			
						
		})
	
	
	return module.exports;
	
};

function shutdown (cb) {
	console.log('shutdown party');
	STORE.flush(function (err) {
		if (err) console.log('failure storing game state', err);
		console.log('saved game state');
		cb();	
	});
}

function join(socket) {
  socket.on('joinLobbyGame', function (msg, fn) {
    var game = games[msg.matchID];
    if (game.players.indexOf(msg.playerID) == -1) game.players.push(msg.playerID);
    if (game.players.length == 2) {
      if (wantsAsync.indexOf(game) != -1) {
		  var spliced = wantsAsync.splice(wantsAsync.indexOf(game), 1);
		  console.log('spliced', spliced);
		  recentAsync.push(spliced[0]);
	  } // else resuming old
    }
    fn();
  });
}


function lobby(socket, db) {
	socket.once('getLobby', function (msg) {
		console.log('get lobby evt!');		

		var now = new Date().getTime();		
		
		//FIXME memoize..
		function summarizeGame(match) {
		    console.log('match', match);
			var game = games[match.matchID];
			console.log('game', game);

			var isOriginalActive = 
				(game && game.match && game.match.original && game.match.original.socket && game.match.original.socket.connected)
				|| (match.creator && match.creator.socket && match.creator.socket.connected);
			var isPartnerActive =
				game && game.match && game.match.partner && game.match.partner.socket && game.match.partner.socket.connected;
			
			var res = {
			    playerCount: game.players.length,
				matchID: match.matchID,
				active: (isOriginalActive ? 1 : 0) + (isPartnerActive ? 1 : 0),
				creator: game ?					
					{	active: isOriginalActive,
						playerID: game.players.indexOf(msg.playerID) > -1 ? msg.playerID : null,
					}
					: match.creator ? //made but not entered yet
					{	active: isOriginalActive,
						playerID: match.creator.playerID == msg.playerID ? msg.playerID : null,
					} : null,
				partner: game && game.match && game.match.partner ?
					{	active: isPartnerActive,
						playerID: game.match.partner.playerID == msg.playerID ? msg.playerID : null,
					} : null,					
				time: now - match.time						
			};
			return res;
		}
		
		var lobby = {want: wantsAsync.slice(-15).map(summarizeGame),
			 old: recentAsync.slice(-10).map(summarizeGame)};
		console.log('sending lobby', lobby);
		socket.emit('gotLobby', lobby);
		

		socket.once('createAsyncGame', function (msg, fn) {
		   
		    console.log('create game');

			var maxLen = 400;
			var blurb = '';

			crypto.randomBytes(SLUG_LEN, function(ex, buf) {
				var slug = buf.toString('hex');
				var url = 
					msg.baseURI 
					+ "/match.html?matchID=" + slug 
					+ "&playerID=" + msg.playerID
					+ "&name=" + encodeURIComponent('' + msg.name)
					+ "&email=" + encodeURIComponent('' + msg.email);
				var match = {
					time: new Date().getTime(),
					creator: {
						playerID: msg.playerID,
						p: '1',
						m: slug,
						name: msg.name,
						description: null,
						email: msg.email,
						text: blurb,
						a: msg.a,
						emailNotification: msg.emailNotification,
						url: url				
					},
					matchID: slug,
					player1Doc: msg.doc
				};

				wantsMatch[slug] = match;
				wantsAsync.push(match);			
				
				fn({matchID: match.matchID, url: url})
			});
			
		});
	});
}


///////////////
module.exports = {
	init: init,
	shutdown: shutdown
};