console.log('loaded lobby');



/////////////

function getQueryParams () {
	if (location.href.indexOf('?') == -1) return {};
	var res = {};
	var params = location.href.split('?')[1];
	params.split('&')
		.map(function (str) { return str.split('='); })
		.forEach(function (pair) { res[pair[0]] = decodeURIComponent(pair[1]); });
	return res;
}

var presetText = getQueryParams().text ?
	Z.unit(getQueryParams().text).pipeAsync(function (url, cb) {	
		$.ajax({url: url, method: 'GET',
			success: function (v) { cb(null, v); },
			error: function (error) { cb({error: error}, v); }}); })
	: null;

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) 
			return decodeURIComponent(c.substring(nameEQ.length,c.length));
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}
	


var state = {
	//playerID
	//matchID
	//paired
	//docSelf
	//docPartner
	
	//socket
};


function segfault (msg, data) { console.error('exn', msg, data); }	
function segwarn (msg, data) { console.warn('exn', msg, data); }	
	
function registerAccount(cb) {

	console.log('registering account');

	var anyBad = false;		
	$('#nameAsync, #emailAsync, #description').each(function () {
		if (!$(this).val().length) {
			$(this).parent().parent().addClass('has-error');
			anyBad = this;
		} else $(this).parent().parent().removeClass('has-error');			
	});
	if ($('#description').val().length > 140) {
		$('#description').parent().parent().addClass('has-error');
		anyBad = $('#description');
	}
	if (anyBad) return cb('missing ' + $(anyBad).attr('id'));
			
	createCookie('playername', $('#nameAsync').val(), 30);
	createCookie('email', $('#emailAsync').val(), 30);
	createCookie('description', $('#description').val(), 30);
		
		
	console.log('register called', state.playerID);	
	cb();
}	
	
function rot13(s) { //does not need to be secure
	var rotated = s.replace( /[A-z]/g , function(c) {
		return String.fromCharCode( c.charCodeAt(0) + ( c.toUpperCase() <= "M" ? 13 : -13 ) );
	});
	var pre = 'XA';
	var post = 'E';
	if (rotated.indexOf('$') == -1) {
		return pre + rotated.replace('@','$').replace('.','*') + post;
	} else {
		return rotated.replace('$','@').replace('*','.').slice(pre.length, -1 * post.length);
	}
}	


///////////////////////////////

$(function () {
	var c = 0;
	var anim = setInterval(function () {
		if ($('#loadingStage').hasClass('off')) {
			clearInterval(anim);
		}
		c++;
		var txt = 'Connecting to server.';
		for (var i = 0; i < c % 4; i++) 
			txt += '.';
		$('#loadingStage h2').text(txt);
	
	}, 200);	
}());

///////////////


$(function () {
	var q = getQueryParams();

	var name = q.name ? q.name : readCookie('playername');
	if (name) $('#nameAsync').val(name);

	var description = q.description ? q.des : readCookie('description');
	if (description) $('#description').val(description);

	if (q.player) {
		$('#emailAsync').val(rot13(q.player));
	} else {
		var email = q.email ? q.email : readCookie('email');
		if (email) $('#emailAsync').val(email);
	}
			
});	


$(function () {
	$('#description').bind('input propertychange', function () {
		$('#maxLen').text($(this).val().length + ' / 140 characters');
	});
});
	

/////////////


function validNameEmail () {
	
	var res = {
		nameInvalid: false,
		emailInvalid: false,
		anyInvalid: false
	};

	if (!$('#nameAsync').val()) {
		res.nameInvalid = true;
		$('#nameAsync').parent().addClass('has-error');
	} else {
		$('#nameAsync').parent().removeClass('has-error');
	}

	if (!$('#emailAsync').val() || $('#emailAsync').val().indexOf('@') == -1 ) {
		res.emailInvalid = true;
		$('#emailAsync').parent().addClass('has-error');
	} else {
		$('#emailAsync').parent().removeClass('has-error');	
	}

	res.anyInvalid = res.nameInvalid || res.emailInvalid;
	
	return res;
}


function asyncMode(socket) {

	$('#stage2async').removeClass('off').addClass('on');
	
	function makeBlurb (game) {
		return $('<blockquote></blockquote>')
			.addClass('blurb')
			.append(formatText(game && game.creator ? game.creator.text + '' : ''))
			.append($('<span></span>')
				.addClass('word-count'))				
			.toggle(false);
	}
	
	function summarizeElapsed(game) {
		return game.time < 1000 ? '1 second'
			: game.time < 30 * 1000 ? '30 seconds'
			: game.time < 90 * 1000 ? '1 minute'
			: game.time < 10.5 * 60 * 1000 ? Math.round(game.time / (60 * 1000)) + ' minutes'
			: game.time < 15.5 * 60 * 1000 ? '15 minutes'
			: game.time < 20.5 * 60 * 1000 ? '20 minutes'
			: game.time < 25.5 * 60 * 1000 ? '25 minutes'
			: game.time < 30.5 * 60 * 1000 ? '30 minutes'
			: game.time < 45.5 * 60 * 1000 ? '45 minutes'
			: game.time < 60.5 * 60 * 1000 ? '1 hour'
			: game.time < 24 * 60 * 60 * 1000 ? (Math.round(game.time / (60 * 60 * 1000 ))) + ' hours'
			: (Math.round(game.time / (24 * 60 * 60 * 1000 ))) + ' days'
	}
	
	function formatText (text) {
		return $('<div></div>')
			.addClass('text')
			.append(text.split('\n')
				 .map(function (v) { 
					 return $('<p></p>').text(v); }));
	}
	

	function makeBtn (game, returnable, clickable, isOwner, isPartner) {
		var btn = $('<div></div>')
			.addClass('btn')
			.addClass(returnable ? 'btn-info' : clickable ? 'btn-success' : 'btn-default')
			.append($("<i>")
				.addClass('fa fa-lg')
				.addClass('fa-play-circle'))
			.append($("<span>").text(' ' + (returnable ? 'Resume ' : 'Join')))
			.on('click', function  (event) {
				event.stopPropagation();
				if (!clickable && !returnable) return;

				checkingAsyncValidity = true;
				
				var validity = validNameEmail();
				if (validity.anyInvalid) {
					$(validity.nameInvalid ? '#nameAsync' : '#emailAsync')
						.focus();
					return;
				}

				var url = 'match.html?'
						+ 'playerID=' + state.playerID
						+ ($('#nameAsync').val() ? '&name=' + encodeURIComponent($('#nameAsync').val()) : '')
						+ ($('#emailAsync').val() ? '&email=' + encodeURIComponent($('#emailAsync').val()) : '')
						+ '&matchID=' + game.matchID;
						
				state.socket.emit('joinLobbyGame', {playerID: state.playerID, matchID: game.matchID},
				  function () { 
				    window.location.href = url;
				  });
				
			});
			
		if (!clickable && !returnable)
			btn.attr('disabled', 'disabled')
				.css('opacity', 0.5);
			
		return btn;
	}
	
	
	function formatGame (inLobby) {
	
		return function (game, i, lst) {
		
			console.log('game', game);
		
			var isOwner = game.creator && game.creator.playerID == state.playerID;
			var isPartner = game.partner && game.partner && game.partner.playerID == state.playerID;
			var returnable = isOwner || isPartner;
			var clickable = inLobby || returnable;
			
			var elapsed = summarizeElapsed(game);					
			var blurb = makeBlurb(game);
			
			var btn = makeBtn(game, returnable, clickable, isOwner, isPartner);
			
			return $('<li></li>')
				.addClass('list-group-item')
				.addClass('game-match')
				.addClass(clickable ? 'joinable' : 'unjoinable')				
				.addClass(isOwner ? 'owner' : 'partner')
				.append($('<span></span>')
					.text(lst.length - i)
					.addClass('game-counter'))
				.append(btn)
				.append($(clickable ? '<a></a>' : '<span></span>')
					.addClass(isOwner ? 'self' : 'other')
					.addClass(game.playerCount ? 'active' : 'inactive')
					.attr('href', 'javascript:void(0)'))

				.append($('<span></span>')
					.addClass('game-creator-name')
					//.text(game.creator.numWords + " word" + (game.creator.numWords != 1 ? "s":"") + ", " + elapsed + " ago"))
					.text(''))
				.append(blurb)
						
		};
	}
	
	console.log('ask for lobby', state.playerID);
	socket.emit('getLobby', {playerID: state.playerID});
	socket.once('gotLobby', function (q) {
	
	    console.log('got l', q);
	
		$('#asyncOption').remove();

		$('#batched').css('opacity',1.0);			
		
		
		console.log('wants', q.want);
		var realWant = q.want.filter(function (game) { return game.playerCount < 2; });		
		var fakeWant = q.want.filter(function (game) { return game.playerCount > 1; });
		
		console.log('fake want', fakeWant);
		
		
		var orderNew = realWant.map(formatGame(true));
		orderNew.reverse();
		
		var orderOld = realWant.length < 10 ?  
			q.old.concat(fakeWant)
				.slice(-1 * (10 - realWant.length))
				.map(formatGame(false)) 
			: [];
		orderOld.reverse();		
		
		
		console.log({newL: realWant, old: orderOld});
		
		if (orderNew.length)
			$('#games')
				.html('')
				.append(
					(!q.want.length && !q.old.length) ?
					$('<li></li>').addClass('list-group-item').text('No games yet')
					: orderNew);

		if (orderOld.length)
			$('#oldGames')
				.html('')
				.append(orderOld);

		$('#lookAbove, #makeBatch').css('display', 'block');		
	});
	
}


////////////


$(function () {
	
	$('#createAsyncGame').on('click', function () {
	
		checkingAsyncValidity = true;		
		var validity = validNameEmail();
		if (validity.anyInvalid) {
			$(validity.nameInvalid ? '#nameAsync' : '#emailAsync')
				.focus();
			return;
		}
	
		$('#createAsyncGame').val('submitting...');
		$('#createAsyncGame, #asyncText, #nameAsync, #emailAsync').attr('disabled', 'disabled');
		var baseURI = window.location.origin || (window.location.protocol+"//"+window.location.host);
		state.socket.emit('createAsyncGame', 
			{
				playerID: state.playerID,
				name: $('#nameAsync').val(),
				email: $('#emailAsync').val(),
				emailNotification: $('#emailGameLinkRedux').prop('checked'),
				a: getQueryParams().a,
				baseURI: baseURI 
			}, function (ack) {
				var matchID = ack.matchID;
				var url = ack.url;

				if ( $('#emailGameLinkRedux').prop('checked') ) {
					state.socket.emit('emailSelfLink',
						{
							playerID: state.playerID,
							name: $('#nameAsync').val(),
							email: $('#emailAsync').val(),
							url: url,
							matchID: matchID
						}, function (ack) {
							console.log('emailed self');
						});
				} else {
					console.log('skip sending email link');
				}
				
				window.location.href = ack.url;

			});
	});
});			





$(function () {
	$('#emailGameLink').on('change', function () {
		if( $(this).is(':checked')) {
			$('#emailGameLinkRedux').parent().css('display','none');
			$('#emailGameLinkRedux').prop('checked', true);
		} else {
			$('#emailGameLinkRedux').parent().css('display','block');
			$('#emailGameLinkRedux').prop('checked', false);			
		}
	});
	$('#emailGameLinkRedux').on('change', function () {
		$('#emailGameLink').prop('checked', $(this).is(':checked'));
	});
});				


	
/////////////

var checkingAsyncValidity = false;
$(function () {
	$('#nameAsync').bind('input propertychange', function () {
		if (checkingAsyncValidity) {
			var validity = validNameEmail();
			$(this).parent()
				[validity.nameInvalid ? 'addClass' : 'removeClass']('has-error');
		}
	});
	$('#emailAsync').bind('input propertychange', function () {
		if (checkingAsyncValidity) {
			var validity = validNameEmail();
			$(this).parent()
				[validity.emailInvalid ? 'addClass' : 'removeClass']('has-error');
		}
	});
});			


///////////////


function updateUrl(pid) {
	try {
		var newUrl = window.location.href;
		var q = getQueryParams();
		if (q.playerID && q.playerID == pid)
			return;

		newUrl += (newUrl.indexOf('?') == -1 ? '?' : '&') + 'playerID=' + pid;
		history.pushState(
			{},
			"Stories with Friends: The Storytelling Game for Learning Vocabulary",
			newUrl);
		console.log('new URL', newUrl, pid);
	} catch (e) {
		console.error('failed to edit url', e);
	}			
}

//INITIALIZATION
$(function () {
	$('.stage')
		.removeClass('on')
		.addClass('off');
	$('#loadingStage')
		.removeClass('off')
		.addClass('on');
	
	var baseURI = window.location.origin || (window.location.protocol+"//"+window.location.host);
	state.socket = io.connect(baseURI);
	state.socket.on('connect', function () {	
		state.socket.emit('getPIDLobby',
			{playerID: getQueryParams().playerID},
			function (pid) {
			    if (!pid) {
			      console.error('no pid', pid);
			      return;
			    }			
				console.log('got PID', getQueryParams().playerID, '-->', pid);
				updateUrl(pid);
				state.playerID = pid;
				
				$('#loadingStage').removeClass('on').addClass('off');
				loadStage2(state.socket, pid);

			});			
		state.socket.on('modal', function (msg) {
			modal(msg);
		});	
	});		
	console.log('connecting2');
});

function loadStage2 (socket, playerID) {

	function fail(msg) {
		$('#noPartnerText').text(msg);
		$('#noPartner').css('display', 'block');
		segwarn(msg);
	}
	
	var q = getQueryParams();
	
	$('#stage2async').removeClass('off').addClass('on');
	asyncMode(socket);
	
}	

////////////



///////////

$(function () {
	var q = getQueryParams();
	if (q.text) {
		$('#pasting input, #pasting textarea').attr('disabled', 'disabled');
		$('#pasting textarea').val('loading...');
		presetText.pipe(function (v) {
			$('#pasting textarea').val(v);
		});
	}

});

////////////

$(function () {

	$('#emailGameLink').click(function () {
		$('#emailGameLink').val('sending...').attr('disabled', 'disabled');
		var bookID = $('#editLink').attr('href').split('key=')[0];
		$.ajax({
			url: '/api/emailLinkParty',
			type: 'GET',
			data: {
				name: $('#nameAsync').val(), 
				email: $('#emailAsync').val(), 
				bookID: state.bookID				
			},
			success: function (result) {
				if (result.error) {
					return segfault('email link', result);
				} else {
					$('#emailGameLink').attr('disabled', false).val('Sent!').attr('disabled','disabled');					
				}
			},
			error: function (result) {
			
			}
		});
	});
});		


////

$(function () {
	$('#back').on('click', function () {
		window.location.href = 'party.html' + (state.playerID ? '?playerID=' + state.playerID : '');
	});
});