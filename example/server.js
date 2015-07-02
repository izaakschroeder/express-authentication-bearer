
'use strict';

var express = require('express'),
	crypto = require('crypto'),
	authentication = require('express-authentication'),
	Redis = require('redis'),
	path = require('path'),
	bearer = require(path.join(__dirname, '..'));

var redis = Redis.createClient();

function key(data) {
	return 'token:' + data.token;
}

function verify(data, callback) {
	redis.get(key(data), function done(err, result) {
		if (err) {
			return callback(err);
		} else {
			var authed = !!data,
				output = result ? JSON.parse(result) : { error: 'NO_TOKEN' };
			callback(null, authed, output);
		}
	});
}

var app = express(),
	auth = authentication().for(bearer(verify));

// Authenticate with the token
app.get('/secret', auth.required(), function secret(req, res) {
	var data = auth.of(req).authentication;
	res.send({
		message: 'Hello ' + data.user
	});
});

// Generate a new token
app.post('/token', function token(req, res, next) {

	var data = {
		token: crypto.randomBytes(32).toString('base64'),
		expires: 30000,
		scopes: [ 'a', 'b' ],
		user: 'bob'
	};

	redis.setex(key(data), data.expires, JSON.stringify(data), function d(err) {
		if (err) {
			next(err);
		} else {
			res.send(data);
		}
	});
});

app.listen(process.env.PORT);
