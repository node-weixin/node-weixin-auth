'use strict';
var assert = require('assert');
var nodeWeixinAuth = require('../');
var util = require('node-weixin-util');

var app = {
  id: 'wx0201661ce8fb3e11',
  secret: '483585a84eacd76693855485cb88dc8a',
  token: 'c9be82f386afdb214b0285e96cb9cb82'
};

describe('node-weixin-auth node module', function () {
  it('should generate signature and check it', function () {

    var timestamp = new Date().getTime();
    timestamp = 1439402998232;
    var nonce = util.getNonce();
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

  it('should be able to get a token and checkit', function (done) {
    nodeWeixinAuth.tokenize(app, function (error, json) {
      var accessToken = json.access_token;
      var timestamp = new Date().getTime();
      var nonce = util.getNonce();
      var sign = nodeWeixinAuth.generateSignature(accessToken, timestamp, nonce);
      assert.equal(true, nodeWeixinAuth.check(sign, timestamp, nonce));

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
    setTimeout(function () {
      nodeWeixinAuth.determine(app, function (passed) {
        assert.equal(true, !passed);
        done();
      });
    }, 8000);
  });


});
