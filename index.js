'use strict';
var crypto = require('crypto');
var restful = require('node-weixin-request');
var util = require('node-weixin-util');
var validator = require('node-form-validator');
//Last time got a token
var auth = {
  ACCESS_TOKEN_EXP: 7200 * 1000,
  accessToken: null,
  lastTime: null,
  generateSignature: function (token, timestamp, nonce) {
    var mixes = [token, timestamp, nonce];
    mixes.sort();
    var str = mixes.join('');
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
  },
  check: function (token, signature, timestamp, nonce) {
    var newSignature = this.generateSignature(token, timestamp, nonce);
    if (newSignature === signature) {
      return true;
    }
    return false;
  },
  determine: function (app, cb) {
    var now = new Date().getTime();
    if (this.lastTime && ((now - this.lastTime) < this.ACCESS_TOKEN_EXP)) {
      cb(true);
      return;
    }
    this.lastTime = now;
    this.tokenize(app, function () {
      cb(false);
    });
  },
  tokenize: function (app, cb) {
    var baseUrl = 'https://api.weixin.qq.com/cgi-bin/';
    var params = {
      grant_type: 'client_credential',
      appid: app.id,
      secret: app.secret
    };
    var url = baseUrl + 'token?' + util.toParam(params);
    restful.request(url, null, function (error, json) {
      if (!error) {
        auth.accessToken = json.access_token;
      }
      cb(error, json);
    });
  },
  ack: function (token, req, res, cb) {
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
  }
};
module.exports = auth;
