var assert = require('assert');
var optval = require('../optval.js');

assert.equal('foo', optval('foo'));
assert.equal('foo', optval('foo', 'bar'));

assert.equal('bar', optval(undefined, 'bar'));
assert.equal('bar', optval(null, 'bar'));

assert.equal(undefined, optval(undefined));
assert.equal(undefined, optval(null));

assert.equal(undefined, optval(undefined, undefined));
assert.equal(undefined, optval(null, undefined));

assert.equal(null, optval(undefined, null));
assert.equal(null, optval(null, null));