'use strict';
var crypto = require('crypto');
var restful = require('node-weixin-request');
var util = require('node-weixin-util');

//Last time got a token
var ACCESS_TOKEN_EXP = 7200;
var lastTime = null;
var accessToken = null;


var auth = {
  generateSignature: function (token, timestamp, nonce) {
    var mixes = [token, timestamp, nonce];
    mixes.sort();
    var str = mixes.join('');
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
  },

  check: function (signature, timestamp, nonce) {
    var newSignature = auth.generateSignature(accessToken, timestamp, nonce);
    if (newSignature === signature) {
      return true;
    }
    return false;
  },

  determine: function (app, cb) {
    var now = new Date().getTime();
    if (lastTime && ((now - lastTime) < ACCESS_TOKEN_EXP)) {
      cb(true);
      return;
    }
    lastTime = now;
    this.tokenize(app, function() {
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
        accessToken = json.access_token;
      }
      cb(error, json);
    });
  }
};

module.exports = auth;
