if (!this.hasOwnProperty('VERBOSE')) VERBOSE = false;

/***

S: Monadic greedy push stream

	S: create a new stream
		a ::  () | Sched => S a  
		Can specify a scheduler (greedy or topological) //FIXME add incremental

	resolve: push
		(S a).resolve ::  a => S a
	unit: monadic return; create new stream and push
		(S a).unit ::  a => S a
	bind: monadic bind; return new stream from applying f on previous stream vals.
		(S a).bind ::  a -> (b | S b) => S b
		If a->b not provided, defaults to identify function
		If b is an S, automatically lowered. This helps with async returns, e.g.:
				var delayed = S(); delayed.resolve(3); S().unit( delayed ).bind()
		  							~= 
		  						S().unit(3);

Combinators are via P for sane error handling
		  						
***/


/***

//FIXME better type documentation

P().unit(v) => P for constant promise

 Raw promise methods:
   .resolve(v) => () to set promise 
   .fail(v) => () to fail promise 
   .then(good, bad) => P for controlling output on reaction to parent's resolve/fail
      good :: v => ()  on parent resolve; P is .then result promise. Default: then.resolve(v)
	  bad :: v  => ()   on parent fail; P is .then result promise. Default: then.fail(v)
	  'this' of good, bad is result
	.bind( a -> b | a -> P) => P()	See R.bind

  Generally, exceptions are caught and propagated along the promise error stream

***/



function label (o) {
	if (!o) throw 'wat';
	return !o ? 'no_obj'
		: o.constructor === P ? ('P' + o.id) 
//		: o.constructor === PP ? ('P' + o.id) 
//		: o.constructor === Q ? ('Q' + o.id) 
		: o.constructor === S ? ('S' + o.id)
		: 'unknown_type';
}

var id = 0;

//============================================
function GreedySched () {
	if (!(this instanceof GreedySched)) return new GreedySched();
	
	if (VERBOSE) console.log('new greedy');
	
	var nodes = [], id = 0, self = this;
	
	this.Node = function (src) {	
		this.id = id++;
		this.src = src;
		this.flowsTo = [];
		this.dispatch = null; //set by bind
		nodes.push(this);		
	};
	this.canon = function (node) {
			if (node instanceof self.Node) return node;
			for (var i = 0; i < nodes.length; i++)
				if (nodes[i].src === node) return nodes[i];
			throw 'unknown node';
	};
	this.makeNode = function (src) { return new this.Node(src); };
	this.externalBang = function (node, f) { 
		f();
		this.canon(node).flowsTo.forEach(function (sink) { sink.dispatch(node) });
	};
	this.internalBang = this.externalBang;
	this.connect = function (src, sink) { this.canon(src).flowsTo.push(this.canon(sink));  };
	this.disconnect = function (src, sink, binder) {
		src = this.canon(src);
		sink = this.canon(sink);
		var b = this.canon(binder);
		b.dispatch = function () {	};		
		nodes = nodes.filter(function (o) { return o != b; });
		for (var i = 0; i < src.flowsTo.length; i++)
			if (src.flowsTo[i] === sink)				
				return src.flowsTo.splice(i, 1);
		throw ['unknown dependency', src, sink];
	}
	this.bind = function (sink, f) {  this.canon(sink).dispatch = f; };
};

function TopologicalSched () {
	var outerQ = [], innerQ = [];

	if (!(this instanceof TopologicalSched)) return new TopologicalSched();
	if (VERBOSE) console.log('new topo scheduler');
	this.makeNode = function (src) { 
		var res = this.constructor.prototype.makeNode.call(this, src);
		res.level = 0;
		return res;
	};
	var Pulse = function (sink, f) { this.sink = sink; this.f = f; }

	var flushing = false;
	var self = this;
	var flush = function () {
		if (flushing) return;
		flushing = true;
		while (innerQ.length || outerQ.length) {
			while (innerQ.length > 0) {
//				console.log(outerQ.length, innerQ.length, 'sink', innerQ[0].sink);
				var pulse = innerQ.shift();
//				console.log('pulse', pulse.sink.id);
				pulse.f();
			}
			if (outerQ.length) innerQ.push(outerQ.shift());			
		}
		flushing = false;
	};
	this.internalBang = function (node, f, fromScheduler) {
		node = this.canon(node);
		var pulse = new Pulse(node, function () {
			f();			
			if (fromScheduler !== true) node.flowsTo.forEach(function (sink) {
//				console.log('enqueue', node.src.id, '->', sink.src.id);
				self.internalBang(sink, function () { sink.dispatch(node.src); }, true);
			});
		});
		var beforeLen = innerQ.length;
		for (var i = 0; i < innerQ.length; i++) {
			if (node.level < innerQ[i].sink.level) {
				innerQ.splice(i, 0, pulse);
				break;
			}
		}
		if (beforeLen === innerQ.length) innerQ.push(pulse);				
		flush.call(this);
	};	
	this.externalBang = function (node, f) {
		var node = this.canon(node);
		outerQ.push(new Pulse(node, function () {
					f();
					node.flowsTo.forEach(function (sink) {
//						console.log('enqueue', node.src.id, '->', sink.src.id);
						self.internalBang(sink,  function () { sink.dispatch(node.src); }, true);
					}) }));
		flush.call(this);
	};	
	var updateLevels = function (sink, sourceLevel) {
		var res = 0;
		if (sink.level <= sourceLevel) {			
			res++;
			sink.level = sourceLevel + 1;
//			console.log('raise', sink.src.id, 'to', sink.level);
			sink.flowsTo.forEach(function (s) { 
//				console.warn('recursive update'); //FIXME cycle check?
				res += updateLevels(s, sink); 
			});
		}
		return res;
	};
	this.connect = function (src, sink) { 
		this.constructor.prototype.connect.call(this, src, sink);
		sink = this.canon(sink);
		var numUpdated = updateLevels(sink, this.canon(src).level);
		if (numUpdated) {			
//			console.warn('updated', numUpdated, 'resorting', innerQ.length);
			innerQ.sort(function (pa, pb) { return pa.sink.level - pb.sink.level; });
		}
	};
	this.disconnect = function (src, sink, binder) {
		var b = this.canon(binder);
		innerQ = innerQ.filter(function (o) { return o.sink != b; });
		outerQ = outerQ.filter(function (o) { return o.sink != b; });
		this.constructor.prototype.disconnect.call(this, src, sink, binder);
	}
};
TopologicalSched.prototype = GreedySched();
TopologicalSched.prototype.constructor = TopologicalSched;

//var DEFSCHED = GreedySched;
var DEFSCHED = TopologicalSched;
var DEFSCHEDINSTANCE = new DEFSCHED();
function S (Parent, optDefV /* used by unit */) {
	if (!(this instanceof S)) return new S(Parent, optDefV);
	if (!Parent) {
		Parent = this;
		this.sched = DEFSCHEDINSTANCE;
		if (VERBOSE) console.log('P sched', DEFSCHEDINSTANCE.toString().split(" ")[1]);
	}
	this.sched = Parent.sched;
	this.id = id++;
	var state = {schedNode: this.sched.makeNode(this)};
	this.__state = state;
	if (optDefV) state.ret = optDefV.val;
	var self = this;

	this.resolve = function (v) { 
		this.sched.externalBang(this, function () { /* console.log('ext set', self.id); */ state.ret = v; });
		return this;
	};
	this.__propagate = function (v) {
		this.sched.internalBang(this, function () { /* console.log('int set', self.id); */ state.ret = v; });
	};
	this.__unbind = function (ret1, res) { this.sched.disconnect(ret1, res, this); };
	this.bind = function (f) {
		if (!f) f = function (v) { return v; };
		var res = new S(Parent);
		var ret1 = null, bound = null;
		var self = this;
		var dispatch = function (src) { 
//			console.log('dispatch', src.id, '=>', res.id);
			if (src === ret1) { /* console.log('skip, handled by bind', src.id, '=>', res.id); */ /* handled by ret1.bind(...) */ }
			else if (src === self) { //src === self
				var oldRet1 = ret1;
				ret1 = f.call(res, state.ret);
				if ((oldRet1 === ret1) && (ret1 instanceof res.constructor)) {
					if (ret1.__state.hasOwnProperty('ret')) res.__propagate(ret1.__state.ret);
//					console.log('skip rebind', res.id);
				} else {
					if (bound) {
//						console.log('unbound');
						bound.__unbind(oldRet1, res);
						bound = null;
					}
					if ((ret1 instanceof res.constructor) && (ret1.constructor === res.constructor)) {
						res.sched.connect(ret1, res);					
						bound = ret1.bind(function (ret2) {  res.__propagate(ret2);  });
//						console.log('created bound', bound.id, '/', res.id, '<=', ret1.id);
					} else {
						res.__propagate(ret1);
					}				
				}				
			} else {
				console.error('internal err; unexpected other src', src.id, self.id, src === self, src, self);
			}
		};
		this.sched.bind(res, dispatch);
		this.sched.connect(state.schedNode, res);
		if (state.hasOwnProperty('ret')) {
//			console.log('sync prop',this.id,'==',state.ret,'==>',res.id);
			dispatch(this);
		}
		return res;		
	};
	//synchronous!
	this.unit = function (v) { return (new (this.constructor)(Parent, {val: v})); };
	
	//streaming
	this.merge2 = function (b) {
		var res = new S(Parent);
		var fired = state.hasOwnProperty('ret') + b.__state.hasOwnProperty('ret');
		var ranFirstMerge = false;
		var ret = [state.hasOwnProperty('ret') ? state.ret : null, 
				   b.__state.hasOwnProperty('ret') ? b.__state.ret : null];
		var dispatch = function (src) {
//				console.log('merge dispatch on', res.id, 'fire count: ', fired, 'ran first:', ranFirstMerge, res.id, 'src:', src.id);
				src.id;
				if (fired === 2 && !ranFirstMerge) {
//					console.log('squash', ret[0].val, ret[1].val);
					ranFirstMerge = true;
				} else {
//					console.log('proceed', ret[0], ret[1]);
					var out = ret;
					fired = 0;
					ranFirstMerge = false;			
					ret = [null, null];
//					console.log('register merge bang', res.id, out);
					res.__propagate(out);			
				}
			};
		this.sched.bind(res, dispatch);

		var merger = function (node, pos, res) {				
			var count = 0;
			var s = (! node.__state.hasOwnProperty('ret')) ? node
				: (node.bind(function (v) { return count++ ? v : new S(Parent); }));
			var bound = s.bind(function (v) { /* console.log('edge fire', node.id); */ ret[pos] = v; fired++; }); 
			node.sched.connect(bound, res);
//			console.log('connected', node.id, '(', node.__state.schedNode.level, ') ->', bound.id, ' (', bound.__state.schedNode.level,') ==> ', res.id, '(',res.__state.schedNode.level, ')');
			return bound;
		};

		var thisConn = merger(this, 0, res);
		var bConn = merger(b, 1, res);
		
//		console.log('merging',thisConn.id,'(', thisConn.__state.schedNode.level,')', bConn.id, '(', bConn.__state.schedNode.level,') =>', res.id, '(', res.__state.schedNode.level, ')');
		if (state.hasOwnProperty('ret')) dispatch(thisConn); 
		if (b.__state.hasOwnProperty('ret')) dispatch(bConn);

		return res;		
	};
};
var SProtoM = function () {};
SProtoM.prototype = Function;
S.prototype = new SProtoM();
S.prototype.constructor = S;

//============================================

//Promise is an S with tagged exceptions
function P(boundTo /* optional (used by bind) */, optDefV /* optional (used by unit) */) {
	if (!(this instanceof P)) return new P(boundTo, optDefV);
	this.id = id++;
	
	this.__q = boundTo ? boundTo : new S(this.constructor.prototype, optDefV);
	this.resolve = function (v) {
		this.__q.resolve({val: v});
		return this;
	};
	this.fail = function (v) {
		this.__q.resolve({err: v});
		return this;
	};
	var self = this;
	this.bind = function (f) {
		if (!f) {
			f = function (v) { //identity
				if (v.hasOwnProperty('err')) throw v.err; 
				return v.val; 
			};		
		}
		return new (this.constructor)(this.__q.bind(function (taggedV) {
			try { 
				var val = f.call(self, taggedV);
				var res =  ((val instanceof self.constructor) 
					  && (val.constructor === self.constructor)) ?
					val.__q : {val: val};
				if (VERBOSE) console.log('progress', res);
				return res;
			} catch (e) { 
				if (VERBOSE) console.error('error', e);
				return {err: e}; 
			}			
		}));
	};
	//synchronous!
	this.unit = function (v) { return new (this.constructor)(null, {val: {val: v}}) };
	this.merge2 = function (b) { return new (this.constructor)(this.__q.merge2(b.__q)); }; //FIXME should expose errs
}
P.prototype = new S();
P.prototype.constructor = P;

if (VERBOSE) console.log('===== created P =====');

try {
	exports.P = P;	
	exports.S = S;
} catch (e) { }