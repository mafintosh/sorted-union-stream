var assert = require('assert');
var Readable = require('stream').Readable;
var union = require('./index');

var a = new Readable({objectMode:true});
var b = new Readable({objectMode:true});
a._read = b._read = function() {};

a.push(4);
a.push(6);
a.push(10);
a.push(14);
a.push(15);
a.push(20);
a.push(22);
a.push(null);

b.push(6);
b.push(11);
b.push(20);
b.push(null);

var u = union(a, b);
var expected = [4,6,10,11,14,15,20,22];

u.on('data', function(data) {
	assert(data === expected.shift());
});

u.on('end', function() {
	assert(!expected.length)
});
