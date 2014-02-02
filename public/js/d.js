var D = (function () {

	var ret = {};
	
	ret.swap = function (prev) {
		var old = prev;
		return function (next) {
			old.parentNode.replaceChild(next, old);
			old = next;
			return next;
		};
	};

	var tags = ["div","h2","h1","h3","hr","span","ul","ol","li","p","iframe","img","a","b","i","pre","br"];
	
	tags.forEach(function (v) {
		ret["$" + v] = function () {
			var res = document.createElement(v);
			Array.prototype.slice.apply(arguments).forEach(function (c) { 
					res.appendChild(typeof(c) == 'string' ? document.createTextNode(c) : c);
				});
			return res;
		};
	});

	var last = new Date().getTime();
	ret.rateLimit = function (/* f, ctx, arg0, ... */) {
		var args = Array.prototype.slice.apply(arguments);		
		var now = new Date().getTime();
		var elapsed = now - last;
		var delay = THROTTLE - elapsed;
		if (delay > 0) {
			if (VERBOSE)
				console.warn('delay for rate limiting', args, delay + 'ms');
			setTimeout(function () {
				ret.rateLimit.apply(this, args);
			}, delay);
		} else {
			last = now;
			var f = args.shift();
			var ctx = args.shift();
			f.apply(ctx, args);
		}
	};
	/*
	ret.calm = function (f, t, allowOccasional) {
		var last = 0; //lastOut if outstanding, lastIn if !outstanding

		var outstanding = null;
		var makeTimeout = function (f, t, v) {
			var id = 0;
			var g = function () { 
					if (outstanding == id) outstanding = null;
					if (allowOccasional) last = new Date().getTime();
					f(v);
				};
			id = setTimeout(f,t);
			outstanding = id;
		};
		
		return function (v) {			
			var now = new Date().getTime();
			if (allowOccasional) {
				if (!outstanding || (t < now - last)) {
					if (outstanding) clearTimeout(outstanding);
					last = now;
					f(v);
				} else {
					makeTimeout(f, t - (now - last), v);
				}
			} else {
			
			}
			
			if (t < now - last || (allowOccasional && !outstanding)) {
				if (outstanding) clearTimeout(outstanding);
				if (allowOccasional) {
					last = now;
					f(v);
				} else {
					outstanding = setTimeout(f, t, v);
					last = now;
				}
			} else {
				if (allowOccasional) {
					outstanding = setTimeout(f, t - (now - last), v);
				} else {
					outstanding = setTimeout(f, t, v);
					last = now;
				}
			}
		};
	};
	*/
	ret.xhrJSON = function (url, cb) {
		var go = function (url, cb) {
			if (VERBOSE) console.log('sending xhr', url); 
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) {
					var resO = null;
					var err = null;
					try {
						resO = JSON.parse(xhr.responseText);
						if (!resO) err = {err: "no xhr res, url" + url, val: resO};
					} catch (e) {
						console.error('failed xhr parse', url, e, xhr.responseText, cb);
						err = {error: {'url': url, err: e}};
					}					
					cb(err, resO);				
					if (VERBOSE) console.log('  received xhr', url, resO);
				}
				//if (VERBOSE) console.log(xhr);			
			};
			xhr.send(null);		
		};
		ret.rateLimit(go, {}, url, cb);
	};
	
	var callbackCount = 0;
	ret.jsonP = function (makeUrl, cb) {
		var go = function (makeUrl, cb) {
			callbackCount++;
			var funcName = 'jsonp_' + callbackCount;
			var url = makeUrl(funcName);
			if (VERBOSE) console.log('sending jsonP',funcName,url.substring(0,20));
		
			window[funcName] = function (v) {
				if (VERBOSE) console.log('  received jsonP', url.substring(0,20), v);
				delete window[funcName];
				cb(null, v);
			};	
				
			var elt = document.createElement("script");
			elt.setAttribute('type', 'text/javascript');
			elt.setAttribute('src', url);
			
			document.getElementsByTagName('head')[0].appendChild(elt);	
		};
		ret.rateLimit(go, {}, makeUrl, cb);
	};
	
	ret.spawner = function (fn, bindings, isAsync) {
	
		var buildT = new Date().getTime();
	
		var workerFn = function () {
				var initT = new Date().getTime(); //worker start
				var startT = null; //message start
				var doneT = null; //worker return
				
				onmessage = function(m) {
						
						startT = new Date().getTime();
						
						var workerF = "REPLACEME";
						var isAsync = "REPLACEME";
						var callb = function (err, data) {						
							doneT = new Date().getTime();							
							var res = {init: initT, start: startT, done: doneT};
							if (err) res.err = JSON.stringify(err);
							else res.val = data;
							postMessage(res);
						};
						try {
							if (isAsync) workerF(m.data, callb);
							else callb(null, workerF(m.data));
						} catch (e) {
							callb("err: " + e.toString());
						}
				}
				
				function importObj (id, f) {
					var o = id.split(".").reduce(function (acc, id) {
						var res = acc.hasOwnProperty(id) ? acc[id] : null;
						if (!res) acc[id] = {parent: acc, id: id};
						return acc[id];	
					}, self);
					o.parent[o.id] = f;
				}	
				
			};
		var workerStr = workerFn.toString().substr("function () {".length).slice(0,-1);
		workerStr = workerStr
				.replace('var workerF = "REPLACEME"', 'var workerF = (' + fn.toString() + ')')
				.replace('var isAsync = "REPLACEME"', 'var isAsync = ' + isAsync)			
		if (bindings) {
			workerStr = bindings.reduce(function (acc, pair) {
					return acc + "\n" + "importObj('" + pair[0] + "', " + 
						(typeof(pair[1]) == "string" ? "\"" + pair[1] + "\"" : pair[1].toString())
						+ ")";
				}, workerStr);
		}
		
		var workerBlob = window.URL.createObjectURL(new Blob([ workerStr ], { type: "text/javascript" }));
	
		return function (data, cb) {
			var spawnT = new Date().getTime();	
			var worker = new Worker(workerBlob);			
			worker.onmessage = function(data) {
						var receiveT = new Date().getTime();
						var m = data.data;
						if (m.hasOwnProperty('err')) cb(m.err);
						else {
							m.spawn = spawnT;
							if (VERBOSE) {
								console.log('SPAWN');
								console.log('    (since build call', spawnT - buildT, 'ms)');
								console.log('  init:', m.init - m.spawn,'ms');
								console.log('  boot:', m.start - m.init,'ms');
								console.log('  compute:', m.done - m.start,'ms');
								console.log('  transfer (/delay):', receiveT - m.done,'ms');
								console.log('  TOTAL:', (receiveT - m.spawn)/1000.0, 's (', (receiveT - buildT)/1000.0, 's since building)');
							}
							cb(null, m);
						}
						worker.terminate();
				};
			worker.postMessage(data);
		};
	};
	
	ret.bindings =  [["D.xhrJSON", ret.xhrJSON], ["ret.rateLimit", ret.rateLimit], 
		["last",last], ["THROTTLE", THROTTLE], ["VERBOSE", VERBOSE], 
		["console.log",function(){}], ["console.error",function(){}], ["console.warn", function () {}]];
	var res = {};
	for (var i in ret) res[i] = ret[i];
	return res;
}());