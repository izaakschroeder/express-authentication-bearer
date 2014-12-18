
'use strict';

var _ = require('lodash'),
	header = require('auth-header'),
	async = require('express-async');

module.exports = function bearer(options) {

	// Defaults
	if (_.isFunction(options)) {
		options = { verify: options };
	}

	options = _.defaults(options, {
		from: [ 'header', 'body', 'query' ]
	});

	// Safety
	if (!_.isObject(options)) {
		throw new TypeError();
	} else if (!_.isFunction(options.verify)) {
		throw new TypeError();
	}

	function fromQueryString(req, res, next) {
		if (req.query.access_token) {
			req.challenge = {
				token: req.query.access_token
			};
		}
		next();
	}

	function fromHeader(req, res, next) {
		if (req.get('Authorization')) {
			req.challenge = header.parse(req.get('Authorization'));
		}
		next();
	}

	function fromBody(req, res, next) {
		if (req.body && req.body.access_token) {
			req.challenge = {
				token: req.body.access_token
			};
		}
		next();
	}

	function authenticate(req, res, next) {
		if (req.challenge) {
			options.verify(req.challenge, function done(err, auth, result) {
				if (err) {
					next(err);
				} else {
					req.authenticated = auth;
					req.authentication = result;
					next();
				}
			});
		} else {
			next();
		}
	}

	var middlewares = _.chain({
			header: fromHeader,
			query: fromQueryString,
			body: fromBody
		})
		.pick(options.from)
		.values()
		.concat(authenticate)
		.value();

	return async.serial(middlewares);
};
