//===========================================================================
/*** tests ***/

////// S
function testSBindInput () {
	var out = 0;

	var a = S();
	var b = a.bind(function (v) { out += v; });
	if (VERBOSE) console.log('a', a.id, 'b', b.id);
	a.resolve(10);

	if (VERBOSE) console.log(out);
	if (out != 10) throw arguments.callee;
}
function testSBindInputMult () {
	var out1 = 0;
	var out2 = 0;

	var a = S();
	a.bind(function (v) { out1 += v; });	
	a.bind(function (v) { out2 += v; });
	a.resolve(10);

	if (out1 != 10 || out2 != 10) throw arguments.callee;
}
function testSBindOutputFlat () {
	var out = 0;

	var a = S();
	a.bind(function (v) { return 10; }).bind(function (v) { out += v; return v; });
	a.resolve(10);

	if (VERBOSE) console.log(out);
	if (out != 10) throw arguments.callee;
}
function testSBindRepeat () {
	var out = 0;
	
	var a = S();
	var b = S();
	b.resolve(1);
	if (VERBOSE) console.log('-=======-');
	var bound = a.bind(function (_) { return b; })
	var printer = bound.bind(function (v) { out += v });
	if (VERBOSE) console.log('a', a.id, 'b', b.id, 'res', bound.id, 'printer', printer.id);
	if (VERBOSE) console.log('~~~~start', out);
	if (VERBOSE) console.log('=========');
	a.resolve(2); //1	
	if (VERBOSE) console.log('=== +1 ===>1', out);
	b.resolve(4); //5
	if (VERBOSE) console.log('=== +4 ===>5', out);
	b.resolve(8); //13
	if (VERBOSE) console.log('=== +8 ===>13', out);
	a.resolve(16); //21
	if (VERBOSE) console.log('=== +8 ==>21', out);
	
	if (VERBOSE) console.log(out)
	if (out != 21) throw arguments.callee;
	
}

function testSBindUnit () {
	var out = null;
	
	var a = S().unit(10).bind(function (v) { out = v; });
	
	if (out != 10) throw arguments.callee;
}

function testSBindUnitChain () {
	var out = null;
	
	var a = S().unit(10).unit(20).bind(function (v) { out = v; });
	
	if (out != 20) throw arguments.callee;
}

function testSBindDelayed () {
	var out = null;
	
	var a = S();	
	var b = S();
	a.bind(function () { return b; }).bind(function (v) { out = v + 1; });
	a.resolve(10);
	b.resolve(20);
	
	if (out != 21) throw arguments.callee;
}

function testSBindDelayedUnhook () {
	var out = 0;
	
	var a = S();	
	var b = S();
	var c = S();
	var bound = a.bind(function (p) { return p; });
	var printer = bound.bind(function (v) { out += v; });
	if (VERBOSE) console.log('a', a.id, 'b', b.id, 'c', c.id, 'res', bound.id, 'printer', printer.id);
	if (VERBOSE) console.log('=====');
	a.resolve(b);
	if (VERBOSE) console.log('=== nothing yet (switch to b) ===', out);
	a.resolve(c); //most recent binding, b should be unhooked
	if (VERBOSE) console.log('=== nothing yet (switch to c) ===', out);
	c.resolve(30);
	if (VERBOSE) console.log('=== + 30 == 30 ==', out);
	b.resolve(20);
	if (VERBOSE) console.log('=== ignore == 30 ==', out);
	
	if (out != 30) {
		if (VERBOSE) console.log(out);
		throw arguments.callee;
	}
	
}


function testSUnitV () {
	var out = 0;

	var a = S();
	a.unit(20).bind(function (v) { out = v; });
	
	if (out != 20) throw arguments.callee;
}

function testSBindDelayedSync () {
	var out = 0;
	
	var a = S().unit(10);
	var b = a.unit(20);	
	if (VERBOSE) console.log('-----', a.id, b.id);
	var c = a.bind(function () { if (VERBOSE) console.log('init'); return b; });
	if (VERBOSE) console.log('!!!!!', c.id);
	c.bind(function (v) { if (VERBOSE) console.log('set'); out = v; });

	if (VERBOSE) console.log('out',out);

	if (out != 20) throw arguments.callee;
}


function testSMergeSimpleLeft () {
	var out = [];
	var count = 0;
	var a = S();
	a.merge2(S()).bind(function (v) { out.push(v); });
	a.resolve(5);
	
	if (VERBOSE) console.log('out',out);
	if (!out || out.length != 1 || out[0].length != 2 || out[0][0] != 5 || out[0][1] != null) throw arguments.callee;
};

function testSMergeSimpleRight () {
	var out = [];
	var count = 0;
	var a = S();
	S().merge2(a).bind(function (v) { out.push(v); });
	a.resolve(5);
	
	if (VERBOSE) console.log('out',out);
	if (!out || out.length != 1 || out[0].length != 2 || out[0][0] != null || out[0][1] != 5) throw arguments.callee;
};

function testSMergeSimpleBoth () {
	var out = [];
	var count = 0;
	var a = S();
	a.merge2(a).bind(function (v) { out.push(v); });
	a.resolve(5);
	
	if (VERBOSE) console.log('out',out);
	if (!out || out.length != 1 || out[0].length != 2 || out[0][0] != 5 || out[0][1] != 5) throw arguments.callee;
};


function testSMerge () {
	var out = [];
	var count = 0;
	var a = S();
	a.merge2(a).bind(function (v) { out.push(v); });
	a.resolve(5);
	a.resolve(10);
	
	if (VERBOSE) console.log(out);
	if (out.length != 2 || out[0][0] != 5 || out[0][1] != 5 || out[1][0] != 10 || out[1][1] != 10) throw arguments.callee;
};


function testSMergeLeft () {
	var out = [];
	var a = S();
	var b = S();
	a.merge2(b).bind(function (v) { out.push(v); });
	a.resolve(5);
	a.resolve(10);
	
	if (out.length != 2 || out[0][0] != 5 || out[1][0] != 10 || out[0][1] || out[1][1]) throw arguments.callee;
};

function testSMergeRight () {
	var out = [];
	var a = S();
	var b = S();
	a.merge2(b).bind(function (v) { out.push(v); });
	b.resolve(5);
	b.resolve(10);
	
	if (out.length != 2 || out[0][1] != 5 || out[1][1] != 10 || out[0][0] || out[1][0]) throw arguments.callee;
};

function testSMergeAsync () {
	var out = [];
	var a = S();
	var mt = S();
	var b = a.bind(function (v) { if (v) return v; else return mt; }); //filtered a
	a.merge2(b).bind(function (v) { out.push(v); });
	a.resolve(true); //[true, true]
	a.resolve(false); //[false, null]

	if (out.length != 2 
		|| out[0][0] != true || out[0][1] != true 
		|| out[1][0] != false || out[1][1] != null) throw arguments.callee;
}

function testSMergeInit () {
	var out = 0;
	
	var a = S();
	a.merge2(a.unit(10)).bind(function (v) { out = v; });
	
	if (!out || out.length != 2 || out[1] != 10) throw arguments.callee;
	
}

function testSMergeMult () {
	var out1 = 0;
	var out2 = 0;
	
	var a = S();	
	var res1 = a.merge2(a).bind(function (v) { out1 = v; });
	var res2 = a.merge2(a).bind(function (v) { out2 = v; });
	a.resolve(5);
	
//	console.log(res1.id,'=>',out1);
//	console.log(res2.id,'=>',out2);
	
	if (!out1 || out1.length != 2 || out1[0] != 5 || out2[1] != 5
		|| !out2 || out2.length != 2 || out2[0] != 5 || out2[1] != 5) throw arguments.callee;

}


function testSMergeMult2 () {
	var out = 0;
	var out1 = 0;
	var out2 = 0;
	
	var a = S();
	var res1 = a.merge2(a);
	res1.bind(function (v) { out1 = v; });

	var res2 = res1.merge2(a)
	res2.bind(function (v) { out2 = v; });
	
	res2.bind(function (v) { out = v; });
	a.resolve(5);


	if (VERBOSE) console.log(res1.id,'=>',out1);
	if (VERBOSE) console.log(res2.id,'=>',out2);
	
//	console.log(out);
	if (!out || out.length != 2 
		|| !out[0] || out[0].length != 2 || out[0][0] != 5 || out[0][1] != 5 
		|| out[1] != 5) throw arguments.callee; 
}

/////// P

function testBindInput () {
	var out = null;

	var a = P();
	a.bind(function (v) { out = v; });
	a.resolve(10);

	if (!out || out.val != 10) throw arguments.callee;
}
function testBindInputMult () {
	var out1 = null;
	var out2 = null;

	var a = P();
	a.bind(function (v) { out1 = v; });	
	a.bind(function (v) { out2 = v; });
	a.resolve(10);

	if (!out1 || out1.val != 10 || !out2 || out2.val != 10) throw arguments.callee;
}
function testBindOutputFlat () {
	var out = null;

	var a = P();
	a.bind(function (v) { return 10; }).bind(function (v) { out = v; return v; });
	a.resolve(10);

	if (!out || out.val != 10) throw arguments.callee;
}

function testPipeChain () {
	var out = 0;
	
	var a = P();
	a.pipe().pipe(function (v) { return v + 1; }).pipe(function (v) { out += v; });
	a.resolve(10);
	a.resolve(20);
	a.resolve(30);
	
	if (out != 63) throw arguments.callee;
}

function testUnitMono () {
	var out = 0;
	
	var a = P();
	
	a.unit(10).unit(20).pipe(function (_) { out++; });
	a.resolve(20);
	a.resolve(30);
	
	if (out != 1) throw arguments.callee;
}
function testUnitV () {
	var out = 0;

	var a = P();
	a.unit(20).pipe(function (v) {  out = v; });
	
	if (out != 20) throw arguments.callee;
}

function testJoinScalar () {
	var out = 0;
	
	var a = P();
	a.join(20, 30).pipe(function (v) { out = v; });
	a.resolve(10);
	
	if (!out || out.length != 3 || out[0] != 10 || out[1] != 20 || out[2] != 30) throw arguments.callee;
}


function testJoin () {
	var out = 0;
	
	var a = P();
	var b = P();
	a.join(b).pipe(function (v) { out = v;});
	b.resolve(20);
	a.resolve(10);
	
	if (!out || out.length != 2 || out[0] != 10 || out[1] != 20) throw arguments.callee;
}

function testPipeFlat () {
	var out = 0;
	
	var a = P();
	a.pipeFlat(function (a,b) { out = a + b; });
	a.resolve([10,15]);
	
	if (out != 25) throw arguments.callee;
}

function testSkipN () {

	var out = 0;
	
	var a = P();
	a.skipN(2).pipe(function (v) { out += v; });
	a.resolve(10);
	a.resolve(20);
	a.resolve(40);
	a.resolve(50);
	
	if (out != 90) throw arguments.callee; 	
}

function testSkipOne () {
	var out = 0;

	var a = P();
	a.skip1().pipe(function (v) { out += v; });
	a.resolve(1);
	a.resolve(2);
	a.resolve(4);
	
	if (out != 6) throw arguments.callee;

}

function testN () {
	var out = 0;

	var a = P();
	a.firstN(3).pipe(function (v) { out += v; });
	a.resolve(1);
	a.resolve(2);
	a.resolve(4);
	a.resolve(8);
	a.resolve(16);
	
	if (out != 7) throw arguments.callee;
	
}

function testN1 () {
	var out = 0;

	var a = P();
	a.one().pipe(function (v) { out += v; });
	a.resolve(1);
	a.resolve(2);
	a.resolve(4);
	
	if (out != 1) throw arguments.callee;

}



function testUntila () {
	var out = 0;
	
	var a = P();
	var b = P();
	a.until(b).pipe(function (v) { /* console.log('  ', v); */ out += v; });
	
	a.resolve(1); //hit
	a.resolve(2); //hit
	b.resolve(4); //hit
	a.resolve(8); //skip
	a.resolve(8); //skip
	a.resolve(8); //skip
	b.resolve(16); //hit
	a.resolve(8); //skip
	a.resolve(8); //skip
	a.resolve(8); //skip
	
	if (out != 23) throw arguments.callee;
	
}

function testUntilb () {
	var out = 0;
	
	var a = P();
	var b = P();
	a.until(b).pipe(function (v) { /* console.log(v); */ out += v; });
		
	b.resolve(1);
	a.resolve(2); //skip
	a.resolve(2); //skip
	a.resolve(2); //skip
	b.resolve(4);
	a.resolve(8); //skip
	a.resolve(8); //skip
	a.resolve(8); //skip
	b.resolve(16);
	a.resolve(8); //skip
	a.resolve(8); //skip
	
	if (out != 21) throw arguments.callee;
	
}

function testStartAs () {
	var out = 0;
	
	var a = P();
	a.startAs(1).pipe(function (v) { out += v; });
	a.resolve(3);
	a.resolve(5);
	
	if (out != 9) throw arguments.callee; 
}

function testStartWith () {
	var out = 0;

	var a = P();
	var b = P();
	a.startWith(b).pipe(function (v) { /* console.log(' ',v); */ out += v; });
	b.resolve(1);
	b.resolve(2);
	a.resolve(4);
	a.resolve(8);
	a.resolve(16);
	
	b.resolve(32); //skip
	b.resolve(64); //skip
	
	if (out != (1 + 2 + 4 + 8 + 16)) throw arguments.callee; 
}

function testMerge2Left () {
	var out = 0;
	
	var a = P();
	a.merge2(P()).pipe(function (v) { /* console.log('  ',v); */ out += v[0]; });
	a.resolve(1);
	a.resolve(3);
	
	if (out != 4) throw arguments.callee;
}

function testMerge2Right () {
	var out = 0;
	
	var a = P();
	P().merge2(a).pipe(function (v) { /* console.log('  ',v); */ out += v[1]; });
	a.resolve(1);
	a.resolve(3);
	
	if (out != 4) throw arguments.callee;
}

function testMerge2Both () {
	var out = 0;
	
	var a = P();
	a.merge2(a).pipe(function (v) { /* console.log('  ',v); */ out += v[0] + v[1]; });
	a.resolve(1);
	a.resolve(3);
	
	if (out != 8) throw arguments.callee;
}

function testMergeInit () {
	var out = 0;
	
	var a = P();
	a.merge(a.unit(4)).pipe(function (arr) { out += arr[1]; });
	
	if (VERBOSE) console.log('out', out);
	
	if (out != 4) throw arguments.callee;
	
}

function testMerge () {
	var out = [];

	var a = P();
	var b = a.pipe(function (v) { return v + 1; });
	var c = P();	
	a.merge(b, c).pipe(function (v) { out.push(v); });
	
	a.resolve(10);
	a.resolve(20);
	c.resolve(30);
	
	if (out.length != 3 
		|| out[0][0] != 10 || out[0][1] != 11  || out[0][2] != null
		|| out[1][0] != 20 || out[1][1] != 21  || out[1][2] != null
		|| out[2][0] != null || out[2][1] != null || out[2][2] != 30) throw arguments.callee;		
}

function testMergeMult() {
	var out = [];
	var a =  P();
	a.merge(a, a).pipe(function (v) { out = v; });
	if (VERBOSE) console.log('~~~~');
	a.resolve(7);
	
	if (VERBOSE) console.log('=== out:',out);
	if (out.length != 3 || out[0] != 7 || out[1] != 7 || out[2] != 7) throw arguments.callee;
}

function testMergeSparse () {
	var out = 0

	var a = P();
	var a2 = a.pipe(function (v) { return v + 2; });
	var b = P().unit(20);
	var a4 = a.pipe(function (v) { return v + 3; });
	if (VERBOSE) console.log('merge 4:', a.id, a2.id, b.id, a4.id);
	a.merge(a2, b, a4).pipe(function (arr) { out = arr; });
	if (VERBOSE) console.log('====',out,'====');
	
	a.resolve(5);
	
	if (VERBOSE) console.log('====',out,'====');
	
	if (VERBOSE) console.log(out);
	if (!out || out[0] != 5 || out[1] != 7 || out[2] != null || out[3] != 8) throw arguments.callee;
}


var success = false;
success = (function () {
	var failOnError = true;

	var tests = [];
	for (var i in window) if (i.substring(0,4) == "test") tests.push(window[i]);	

	var runTests = function () {
		tests.map(function (test) {
//			if (VERBOSE) console.clear();
			if (VERBOSE) console.log('==== ' + test.toString().split(" ")[1] + ' ====');
			test();
			if (VERBOSE) console.log('passed', test.toString().split(" ")[1]);
		});
		if (VERBOSE) {
//			console.clear();
			console.log('==unit tests passed==');
		}
		return true;
	};
	
	if (failOnError) {
		return runTests();		
	} else {
		try {
			return runTests();
		} catch (e) {
			if (VERBOSE) console.error(e);
			return false;
		}
	}
}());




