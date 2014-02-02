try {
	P = require('./p.js').P;
} catch (e) {  }



/*
 Combinators (.methods):
   .pipe(f :: a -> b) => P  synchronous application of f on parent resolution
   .catcher() => P  new promise resolves as parent's failure (or never)
   .print() => P   print resolve to console.log, fail to console.err, and return parent
   .pipeAsync( f :: v * cb) => P where cb :: this=P, err * val -> ()
     call asynchronous f in NodeJS style where last param is the continuation handler
     f signals error by calling cb with a non-null first arg
     otherwise the 2nd arg passed to cb is used to resolve the resulting promise
     'this' is the result promise (so cb or this can be used to resolve)
     	if callback invoked, can be used in a synchronous manner if invoked before return
   .n(v) => P  choke to provide at most v returns
   .snapshot(v | P) => P  on parent resolve, resolve to v. When v is a P, resolve may be async.
   .join( a1 * a2 * ...) => P  pass resolved [a0, a1, a2, ...] as resulting promise. Accepts non-promises.
   .merge ( a1 * a2 * ...) => P  most recently resolved a0, a1, a2, ... . If non-promise, resolve with it immediately.
   .pipeFlat( f :: a0 * a1 ... -> b ) => P  apply array-valued promise to f  (helps after .join)
   .dot( string ) => P   index into resolved promise by "." delimited strings in arg
      Ex:   P().unit({x: ['a','b']}).dot("x.1") ~= P().unit('b')
*/
//=============================

P.prototype.source = function () { return new (this.constructor)(this.sched); };

//Stream processing
P.prototype.join = function (/* ... */) {
	return Array.prototype.slice.apply(arguments).reduce(function (acc, arg) {
			return acc.pipe(function (arr) {
				var appender = function (v) { return arr.concat(v); };
				if (arg instanceof acc.constructor && arg.constructor === acc.constructor) {
					return arg.pipe(appender);
				} else {
					return appender(arg);
				}
			});
		}, this.pipe(function (v) { return [v]; }));
}


P.prototype.filter = function (f) {
	if (!f) f = function (v) { return v; };
	var mt = new (this.constructor)();
	return this.pipe(function (v) { return f(v) ? v : mt; });
};

P.prototype.firstN = function (n) { return this.filter(function (v) { return --n >= 0; }); }
P.prototype.one = function () { return this.firstN(1); };
P.prototype.skipN = function (n) { return this.filter(function (v) { return --n < 0; }); };
P.prototype.skip1 = function () { return this.skipN(1); };

P.prototype.until = function (b) {
	if (!(b instanceof this.constructor && b.constructor === this.constructor)) return this.unit(b);
	var started = false;
	var mt = new (this.constructor)();
	return this
		.merge2(b.pipe(function (v) { started = true; return v; }))
		.bind(function (arr) {
			if (started && arr[1]) {
				if (arr[1].hasOwnProperty('err')) throw arr[1].err;
				else return arr[1].val;		
			} else if (started || (arr[0] === null)) {
				return mt;
			} else {
				if (arr[0].hasOwnProperty('err')) throw arr[0].err;
				else return arr[0].val;
			}
		});	
};

P.prototype.startAs = function (v) { return this.unit(v).until(this); };
P.prototype.startWith = function (p) { 
	return (p instanceof this.constructor && p.constructor === this.constructor) ?
		p.until(this)
		: this.startAs(v);
};

P.prototype.merge = function (/* ... */) {
	return Array.prototype.slice.apply(arguments).reduce(
		function (acc, p, i) {		
			return acc.merge2(p).pipe(function (arr) { 
//				console.log('toAppend::::', arr[1], p);
				if (arr[0] == null) {
					arr = [new Array(i + 1), arr[1]];
				}
				//if (VERBOSE) console.info(arr[0].concat(arr[1]),'ret');
				return arr[0].concat(arr[1]); });
		}, this.pipe(function (v) { return [v]; }));
};

P.prototype.mergeFirst = function () {
	return this.merge.apply(this, Array.prototype.slice.apply(arguments)).pipe(function (arr) {
		for (var i = 0; i < arr.length; i++)
			if (arr[i]) return arr[i]; //FIXME tagged?
	});
};

P.prototype.mergeLast = function () {
	return this.merge.apply(this, Array.prototype.slice.apply(arguments)).pipe(function (arr) {
		for (var i = arr.length - 1; i >= 0; i--) if (arr[i]) return arr[i];
	});
};

P.prototype.tag = function (v) {
	return this.pipe(function () { return v; });
};

/*
P.prototype.snapshot = function (p) {
	//FIXME
	throw 'TODO implement ("then" was deprecated)';
	return this.pipeAsync(function (v, continuation) {
			var baseP = (p instanceof this.constructor) ? p : this.unit(p);
			baseP.then(
				function (v) { continuation(null, v); }, 
				function (err) { continuation(err); });
		});
};
*/


//===========================================================================


//Combinators: error handling
P.prototype.pipe = function (f) {
	if (!f) f = function (v) { return v; };
	return this.bind(function (taggedV) { 
		if (taggedV.hasOwnProperty('err')) throw taggedV.err;
		else if (taggedV.constructor == Array) {
			if (taggedV[0] && taggedV[0].hasOwnProperty('err')) throw taggedV[0].err;
			else if (taggedV[1] && taggedV[1].hasOwnProperty('err')) throw taggedV[1].err;
			else return f.call(this, [taggedV[0] ? taggedV[0].val : null, taggedV[1] ? taggedV[1].val : null]);
		} else return f.call(this, taggedV.val);
	});			
};

P.prototype.flipErr = function () {
	return this.bind(function (taggedV) {
		if (taggedV.hasOwnProperty('err')) return taggedV.err;
		else throw taggedV.val;
	});
}


P.prototype.pipeErr = function (f) { return this.flipErr().pipe(f); };


P.prototype.pipeFlat = function (f) {
	return this.pipe(function (arr) {		
		return f.apply(this, Array.prototype.slice.apply(arr)); 
	});
};
P.prototype.pipeAsync = function (f) {
	return this.pipe(function (v) {		
		var res = new this.constructor();
		var sync = true;
		var ret = null;
		f.call(res, v, function (err, data) { 
			if (sync) ret = {err: err, val: data};
			else {
				if (err) res.fail(err);
				else res.resolve(data);
			}
		});
		sync = false;
		if (ret) {
			if (ret.err) throw ret.err;
			else return ret.val;
		} else {
			return res;
		}
	});
};
P.prototype.print = function (lbl) { //purely side-effect; returns original
	this.pipe(function (v) { console.log(lbl ? lbl : 'print', v); return v; });
//	this.pipeErr(function (v) { console.error(lbl ? lbl : 'print', v); return v;});
	return this;
};

var timers = {};
P.prototype.timer = function (lbl) {
	if (!lbl) lbl = "__timer";
	this.pipe(function (v) {
		if (!timers[lbl]) {
			timers[lbl] = new Date().getTime();
			console.log("start timer", lbl);
		} else {
			console.log(lbl, (new Date().getTime() - timers[lbl])/1000.0 + "s");
			delete timers[lbl];
		}});
	return this;		
};

P.prototype.toggleVerbose = function () {
	return this.pipe(function (v) { VERBOSE = !VERBOSE; return v; });
}

P.prototype.dot = function (expr) {
	function dot(expr) {
		return function (obj) {
			var step = obj;
			var fields = expr.split(".");
			for (var i = 0; i < fields.length; i++) step = step[fields[i]];
			return step;
		};
	}
	return this.pipe(dot(expr));
};

Function.prototype.p = function (p) {
	return p.pipe(this);
}

if (VERBOSE) console.log('===created plib===');

try {
	exports.P = P;
} catch (e) {

}