/*jslint node: true */
'use strict';
var crypto = require('crypto');
var restful = require('node-weixin-request');
var util = require('node-weixin-util');
var validator = require('node-form-validator');

function Auth() {
  this.ACCESS_TOKEN_EXP = 7200 * 1000;
  this.accessToken = null;
  this.lastTime = null;
}

Auth.prototype.generateSignature = function (token, timestamp, nonce) {
  var mixes = [token, timestamp, nonce];
  mixes.sort();
  var str = mixes.join('');
  var sha1 = crypto.createHash('sha1');
  sha1.update(str);
  return sha1.digest('hex');
};

Auth.prototype.check = function (token, signature, timestamp, nonce) {
  var newSignature = this.generateSignature(token, timestamp, nonce);
  if (newSignature === signature) {
    return true;
  }
  return false;
};

Auth.prototype.determine = function (app, cb) {
  var now = new Date().getTime();
  if (this.lastTime && ((now - this.lastTime) < this.ACCESS_TOKEN_EXP)) {
    cb(true);
    return;
  }
  this.lastTime = now;
  this.tokenize(app, function () {
    cb(false);
  });
};

Auth.prototype.tokenize = function (app, cb) {
  var baseUrl = 'https://api.weixin.qq.com/cgi-bin/';
  var params = {
    grant_type: 'client_credential',
    appid: app.id,
    secret: app.secret
  };
  var self = this;
  var url = baseUrl + 'token?' + util.toParam(params);
  restful.request(url, null, function (error, json) {
    if (!error) {
      self.accessToken = json.access_token;
    }
    cb(error, json);
  });
};

Auth.prototype.ack = function (token, req, res, cb) {
  console.warn('this method is deprecated, and later may be changed');
  var data = {};
  var error = {};
  var conf = require('./validations/ack');
  if (!validator.v(req, conf, data, error)) {
    cb(true, 1);
    return;
  }
  var check = this.check(token, data.signature, data.timestamp, data.nonce);
  if (check) {
    cb(false, data.echostr);
  } else {
    cb(true, 2);
  }
};

Auth.prototype.extract = function(data) {
  var conf = require('./validations/ack');
  return validator.json.extract(data, conf);
};

Auth.prototype.ack = function (token, data, cb) {
  var error = {};
  var conf = require('./validations/ack');
  if (!validator.validate(conf, data, error)) {
    cb(true, error);
    return;
  }
  var check = this.check(token, data.signature, data.timestamp, data.nonce);
  if (check) {
    cb(false, data.echostr);
  } else {
    cb(true, 2);
  }
};

Auth.prototype.ips = function(app, cb) {
  var auth = this;
  this.determine(app, function() {
    var url = 'https://api.weixin.qq.com/cgi-bin/getcallbackip?' + util.toParam({
        access_token: auth.accessToken
      });
    restful.json(url, null, cb);
  });
};

Auth.prototype.create = function() {
  return new Auth();
};
module.exports = new Auth();
