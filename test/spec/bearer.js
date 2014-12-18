
'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	request = require('supertest'),
	bearer = require('bearer');

describe('bearer', function() {

	beforeEach(function() {
		this.auth = bearer(function(challenge, done) {
			done(null, challenge.token === 'abc', { name: 'bob' });
		});
		this.app = express();
		this.app.use(bodyParser.urlencoded({ extended: false }));
		this.app.use(this.auth);
	});

	it('should fail if no callback given', function() {
		expect(bearer).to.throw(TypeError);
	});

	it('should fail if callback is not a function', function() {
		expect(function() {
			bearer({ });
		}).to.throw(TypeError);
	});


	it('should set the correct token', function(done) {
		this.app.use(function(req, res, next) {
			expect(req.challenge).to.deep.equal({
				token: 'abc'
			});
			next();
		});
		request(this.app).get('/').set('Authorization', 'Bearer abc').end(done);
	});

	it('should set the correct token', function(done) {
		this.app.use(function(req, res, next) {
			expect(req.challenge).to.deep.equal({
				token: 'abc'
			});
			next();
		});
		request(this.app).get('/?access_token=abc').end(done);
	});

	it('should set the correct token', function(done) {
		this.app.use(function(req, res, next) {
			expect(req.challenge).to.deep.equal({
				token: 'abc'
			});
			next();
		});
		/*eslint-disable camelcase*/
		request(this.app)
			.post('/')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send({ access_token: 'abc'})
			.end(done);
	});

	it('should mark non-authenticated requests', function(done) {
		this.app.use(function(req, res, next) {
			expect(req.challenge).to.be.undefined;
			next();
		});
		request(this.app)
			.get('/')
			.end(done);
	});

	it('should set authenticated correctly', function(done) {
		this.app.use(function(req, res, next) {
			expect(req.authenticated).to.equal(true);
			next();
		});
		request(this.app).get('/').set('Authorization', 'Bearer abc').end(done);
	});

	it('should set authenticated correctly', function(done) {
		this.app.use(function(req, res, next) {
			expect(req.authenticated).to.equal(false);
			next();
		});
		request(this.app).get('/').auth('billy', 'yyy').end(done);
	});

	it('should set authentication correctly', function(done) {
		this.app.use(function(req, res, next) {
			expect(req.authentication).to.deep.equal({ user: 'bob' });
			next();
		});
		request(this.app).get('/').set('Authorization', 'Bearer abc').end(done);
	});

	it('should pass on errors from verify function', function(done) {
		var auth = bearer(function(challenge, done) {
			done('my-err');
		});
		var app = express();
		app.use(auth);
		request(app).get('/').auth('Authorization', 'Bearer abc').end(done);
	});
});
