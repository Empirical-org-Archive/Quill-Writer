var request = require("request");
var crypto = require('crypto');
var util = require('util');
var fs = require('fs');

var SLUG_LEN = 5;

var STORE = {
  filename: 'matches.json',
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
    console.log(games);
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
  console.log('reloading matches');
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
    ['games', {}]
  ];
function init(app, io, sendMandrill, db) {
  reloads.forEach(function (p) {
      STORE.bind(p[0], p[1]);
  });  
  
  var playerSockets = {};
  io.sockets
    .on('connection', function (socket) {  
      socket.connected = true;
      console.log('connected', socket.id);

      socket.once('getPID', function (msg, fn) {
        if (msg.playerID) {
          console.log('connecting', 'existing PID', msg);
          console.log('match');
          socket.playerID = msg.playerID;
          playerSockets[msg.playerID] = socket;
          
          //init game
          var game = getGame(msg.matchID, msg.playerID);
          
          return fn({playerID: msg.playerID, messages: game.messages, playerNumber: game.players.indexOf(msg.playerID)});
        } else {
          crypto.randomBytes(SLUG_LEN, function(ex, buf) {            
            var slug = buf.toString('hex');
            console.log('connecting', 'gensym PID', slug);
            socket.playerID = slug;
            playerSockets[slug] = socket;            

            //init game
            var game = getGame(msg.matchID, slug);

            fn({playerID: slug, messages: game.messages, playerNumber: game.players.indexOf(slug)});
          });
        }
      });
      
      socket.on('disconnect', function () {
        socket.connected = false;
        if (socket.playerID && playerSockets[socket.playerID])
          delete playerSockets[socket.playerID];
        console.log('disconnected', socket.playerID, socket.id);
      });
      
      socket.on('playerWrite', function (msg, fn) {
        console.log('playerWrite', msg.playerID);
        var game = getGame(msg.matchID, msg.playerID);
        var playerNumber = game.players.indexOf(msg.playerID);
        var entry = {playerNumber: playerNumber, text: msg.text, i: game.messages.length};
        game.messages.push(entry);
        fn({i: entry.i});
        game.players.forEach(function (partnerID) {
          try {
            console.log('broadcast', msg.playerID, '->', partnerID);            
            playerSockets[partnerID].emit('entryUpdate', 
              {self: playerNumber == game.players.indexOf(partnerID),
               playerNumber: playerNumber,
               text: entry.text,
               i: entry.i});
          } catch (e) {
            console.error('bad broadcast', e, {playerID: msg.playerID, partnerID: msg.partnerID});
          }
        });
      });
    });  
  
  return module.exports;
};

function shutdown (cb) {
  console.log('shutdown party');
  STORE.flush(function (err) {
    if (err) console.log('failure storing game state (match.js)', err);
    else console.log('saved game state');
    cb();  
  });
}

///////////////
function getGame(matchID, playerID) {
  if (!matchID || !playerID) throw 'getGame missing args';
  
  console.log('gaming', matchID, playerID);
  
  var game = games[matchID];
  if (!game) {
    console.log('creating game', {matchID: matchID, playerID: playerID});
    game = {players: [playerID], messages: []};
    games[matchID] = game;
  }
  if (game.players.indexOf(playerID) == -1) 
    game.players.push(playerID);
  return game;
}

///////////////


///////////////
module.exports = {
	init: init,
	shutdown: shutdown
};