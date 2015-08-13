'use strict';
var assert = require('assert');
var nodeWeixinAuth = require('../');
var util = require('node-weixin-util');
var errors = require('web-errors').errors;

var app = {
  id: process.env.APP_ID,
  secret: process.env.APP_SECRET
};

var accessToken, timestamp, nonce, sign;

var request = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');

var server = express();

server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());

server.post('/weixin', function (req, res) {
  nodeWeixinAuth.ack(req, res, function (error, data) {
    if (!error) {
      res.send(data);
      return;
    }
    switch (error) {
      case 1:
        res.send(errors.INPUT_INVALID);
        break;
      case 2:
        res.send(errors.SIGNATURE_NOT_MATCH);
        break;
      default:
        res.send(errors.UNKNOWN_ERROR);
        break;
    }
  });
});

describe('node-weixin-auth node module', function () {
  it('should generate signature and check it', function () {

    timestamp = 1439402998232;
    nonce = 'wo1cn2NJPRnZWiTuQW8zQ6Mzn4qQ3kWi';
    var token = 'sososso';
    var sign = nodeWeixinAuth.generateSignature(token, timestamp, nonce);
    assert.equal(true, sign === '886a1db814d97a26c081a9814a47bf0b9ff1da9c');
  });


  it('should be able to get a token', function (done) {
    nodeWeixinAuth.tokenize(app, function (error, json) {
      assert.equal(true, !error);
      assert.equal(true, json.access_token.length > 1);
      assert.equal(true, json.expires_in <= 7200);
      assert.equal(true, json.expires_in >= 7000);
      done();
    });
  });


  it('should be able to determine to request within expiration', function (done) {
    nodeWeixinAuth.determine(app, function (passed) {
      assert.equal(true, !passed);
      setTimeout(function () {
        nodeWeixinAuth.determine(app, function (passed) {
          assert.equal(true, passed);
          done();
        });
      }, 1000);
    });
  });


  it('should be able to determine not to request within expiration', function (done) {
    //Change access token expiration to 7200 for testing purpose
    nodeWeixinAuth.ACCESS_TOKEN_EXP = 7200;
    setTimeout(function () {
      nodeWeixinAuth.determine(app, function (passed) {
        assert.equal(true, !passed);
        done();
      });
    }, 8000);
  });

  it('should be able to get a token and checkit', function (done) {
    nodeWeixinAuth.tokenize(app, function (error, json) {
      accessToken = json.access_token;
      timestamp = new Date().getTime();
      nonce = util.getNonce();
      sign = nodeWeixinAuth.generateSignature(accessToken, timestamp, nonce);
      assert.equal(true, nodeWeixinAuth.check(sign, timestamp, nonce));

      assert.equal(true, !error);
      assert.equal(true, json.access_token.length > 1);
      assert.equal(true, json.expires_in <= 7200);
      assert.equal(true, json.expires_in >= 7000);
      done();
    });
  });

  it('should be able to auth weixin signature', function (done) {

    var time = new Date().getTime();
    var nonce = 'nonce';
    var signature = nodeWeixinAuth.generateSignature(nodeWeixinAuth.accessToken, time, nonce);
    var echostr = 'Hello world!';
    var data = {
      signature: signature,
      timestamp: time,
      nonce: nonce,
      echostr: echostr
    };
    request(server)
      .post('/weixin')
      .send(data)
      .expect(200)
      .expect(echostr)
      .end(done);
  });

  it('should be failed to auth weixin signature', function (done) {
    var time = new Date().getTime();
    var nonce = 'nonce';
    var signature = nodeWeixinAuth.generateSignature(accessToken, time, nonce);
    var data = {
      signature: signature,
      timestamp: time,
      nonce: nonce
    };
    request(server)
      .post('/weixin')
      .send(data)
      .expect(200)
      .end(done);
  });

});
