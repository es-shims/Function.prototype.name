'use strict';

var implementation = require('../implementation');
var callBind = require('call-bind');
var test = require('tape');
var hasStrictMode = require('has-strict-mode')();
var forEach = require('for-each');
var mockProperty = require('mock-property');
var runTests = require('./tests');

test('as a function', function (t) {
	t.test('bad array/this value', { skip: !hasStrictMode }, function (st) {
		/* eslint no-useless-call: 0 */
		st['throws'](function () { implementation.call(undefined); }, TypeError, 'undefined is not an object');
		st['throws'](function () { implementation.call(null); }, TypeError, 'null is not an object');
		st.end();
	});

	var getName = callBind(implementation);

	t.test('functions without name property', function (st) {
		/* eslint-disable no-eval */
		var functions = [
			['foo', eval('(function foo () {/* named with space */})')],
			['foo', eval('(function foo() {/* named without space */})')],
			['', eval('(function () {/* anonymous with space */})')],
			['', eval('(function() {/* anonymous without space */})')],
			['', eval('(function() {/* function foo */})')]
		];
		/* eslint-enable no-eval */

		forEach(functions, function (testCase) {
			var name = testCase[0];
			var func = testCase[1];

			var restoreName = mockProperty(func, 'name', { 'delete': true });
			t.teardown(restoreName);

			st.equal(getName(func), name, 'function with no name has the name "' + name + '"');
		});
		st.end();
	});

	t.test('pathological function', { ignoreSyncTimeout: false }, function (st) {
		var func = eval('(function(){' + new Array(100001).join(' ') + '})'); // eslint-disable-line no-eval

		var restoreName = mockProperty(func, 'name', { 'delete': true });
		st.teardown(restoreName);

		st.timeoutAfter(250);
		var result = getName(func);
		st.equal(result, '', 'function with no name has the name ""');
		st.end();
	});

	runTests(getName, t);

	t.end();
});
