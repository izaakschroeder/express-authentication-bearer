
'use strict';

var _ = require('lodash'),
	header = require('express-authentication-header');

module.exports = function create(options) {
	if (_.isFunction(options)) {
		options = {
			verify: options
		};
	}
	return header(_.assign({
		scheme: 'Bearer'
	}, options));
};
