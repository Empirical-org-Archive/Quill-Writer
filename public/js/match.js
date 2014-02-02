var state = {
  messages: []
};

function getQueryParams () {
  if (location.href.indexOf('?') == -1) return {};
  var res = {};
  var params = location.href.split('?')[1];
  params.split('&')
    .map(function (str) { return str.split('='); })
    .forEach(function (pair) { res[pair[0]] = decodeURIComponent(pair[1]); });
  return res;
}

function playerNumberToPanel (i) {
  return i == 0 ? 'info' 
    : i == 1 ? 'success'
    : i == 2 ? 'warning'
    : i == 3 ? 'info'
    : i == 4 ? 'error' 
    : 'default';
}


function updateUrl(pid) {
  try {
    var newUrl = window.location.href;
    var q = getQueryParams();
    if (q.playerID && q.playerID == pid)
      return;
    newUrl += (newUrl.indexOf('?') == -1 ? '?' : '&') + 'playerID=' + pid;
    history.pushState(
      {},
      "Stories with Students",
      newUrl);
    console.log('new URL', newUrl);
  } catch (e) {
    console.error('failed to edit url', e);
  }      
}


$(function () {
  
  state.matchID = getQueryParams().matchID;

  var baseURI = window.location.origin || (window.location.protocol+"//"+window.location.host);
  state.socket = io.connect(baseURI);
  state.socket.on('connect', function () {  
    state.socket.emit('getPID',
      {matchID: getQueryParams().matchID, playerID: getQueryParams().playerID},
      function (msg) {      
        var pid = msg.playerID;
        if (msg.messages) state.messages = msg.messages;
        updateUrl(pid);
        console.log('got PID', getQueryParams().playerID, '-->', pid);
        state.playerID = pid;        
        state.playerNumber = msg.playerNumber;
        $('#connecting').removeClass('on').addClass('off');
        startGame();        
      });      
    state.socket.on('modal', function (msg) {
      modal(msg);
    });  
  });
  
  state.socket.on('entryUpdate', function (entry) {
    console.log('update', entry);
    var found = false;
    for (var i = 0; i < state.messages.length; i++) {
      if (state.messages[i].i == entry.i) {
        state.messages[i] = entry;
        found = true;
        break;
      }
    }
    if (!found) {
      state.messages.push(entry);
      state.messages.sort(function (a, b) { return a.i - b.i; });
    }
    rerender(entry);
    checkMessages([entry]);    
  });
  
});

function startGame () {
  $('#game').removeClass('off').addClass('on');
  
  if (state.messages.length) 
    rerender();      
  
  checkMessages(state.messages);
    
  $('#txt').addClass('btn-' + playerNumberToPanel(state.playerNumber));
    
  console.log('started game');
}

function checkMessages (messages) {
  messages.forEach(function (o) {
    $('.word').map(function (i, d) {
      if ($(d).hasClass('used')) return;
      if (o.text.toLowerCase().indexOf($(d).text().toLowerCase()) != -1) { 
        $(d).addClass('used');
        console.log('hit', d, $(d).hasClass('word'));
      }
    });
  });
}
function rerender (changedEntry) {

  function renderEntry (entry, i) {
  
    var img = $('<img />')
          .addClass(entry.playerNumber == 0 ? 'p0' : 'p1')
          .attr('src', entry.playerNumber == 0 ? 'img/alien1.png' : 'img/alien2.png');
    console.log('img', img);
  
    console.log('making', entry, entry.text);
    return $('<span></span>')
      .attr('id', 'story' + i)
      .attr('num', i)      
      .addClass(entry.self ? 'self' : 'other')
      .addClass('player' + entry.playerNumber)
//      .addClass('panel-' + playerNumberToPanel(entry.playerNumber))
      //.addClass('panel').addClass('panel-default')
      .addClass('story')
//      .append(img)
      .append($('<span></span>')
        .text(entry.text))  
  }
  
  if (changedEntry) {
    if (!$('#story' + changedEntry.i).length) {
      $('#stories').append($('#story' + changedEntry.i)
        .replaceWith(renderEntry(changedEntry, changedEntry.i)));
    }
  }

  state.messages.map(function (entry, i) {
    if (!$('#story' + i).length) {
      $('#stories').append(renderEntry(entry, i));
    }
  });
  
  var newOrder = $('.story');
  
  $('#stories').empty();
  
  newOrder.sort(function (a, b) {
    a = parseInt($(a).attr("num"), 10);
    b = parseInt($(b).attr("num"), 10);
    return a - b;
  });
  
  $('#stories').append(newOrder);
  
}

$(function () {


   var words = [
		['Replete', 'Full'],
		['Labyrinth', 'A maze'],
		['Hasten', 'Hurry; accelerate; rush'],
		['Tangent', 'Going off the main subject'],
        ['Abasement', 'Humiliation; degradation'],
        ['Billowing', 'Swelling; fluttering; waving'],
        ['Cower', 'Recoil in fear or servility; shrink away from'],
        ['Enhance', 'Improve; make better or clearer'],
        ['Harangue', 'Noisy, attacking speech'],
        ['Nullify', 'To counter; make unimportant'],
        ['Plaintiff', 'Petitioner (in court of law)'],
        ['Tangible', 'Can be touched'],
        ['Absolution', 'Forgiveness; pardon; release'],
        ['Blatant', 'Obvious'],
        ['Creditable', 'Praiseworthy'],
        ['Ensconce', 'Establish firmly in a position'],
        ['Laceration', 'A cut'],
        ['Obdurate', 'Stubborn'],
        ['Plausible', 'Can be believed; reasonable'],
        ['Reprieve', 'A respite; postponement of a sentence'],
        ['Tawdry', 'Of little value; gaudy']];
        
  var wordsD = words.map(function (pair) {    
    return $('<div></div>').addClass('vocab-pair')
      .append($('<span></span>').addClass('word').text(pair[0]))
      .append($('<span></span>').addClass('des').text(pair[1]));
  });
  
  wordsD.forEach(function (w) { $('#vocab').append(w); });
  


  $('#append').click(function (evt) {
    var msg = {playerID: state.playerID, matchID: state.matchID, text: $('#txt').val()};
    console.log('msg', msg);

	$('#append, #txt').addClass('disabled');
	$('#append, #txt').prop('disabled', true);

    state.socket.emit('playerWrite', msg, function (entry) { 
      $('#txt').val('');
	  $('#append, #txt').removeClass('disabled');
	  $('#append, #txt').prop('disabled', false);
    });
    
    evt.preventDefault();
    
  });
});