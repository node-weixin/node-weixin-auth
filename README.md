#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Server auth for weixin apis


## Install

```sh
$ npm install --save node-weixin-auth
```


## Usage

```js


var nodeWeixinAuth = require('node-weixin-auth');

var app = {
  id: '',
  secret: ''
};

//手动得到accessToken
nodeWeixinAuth.tokenize(app, function (error, json) {
  var accessToken = json.access_token;
});

//自动获得accessToken，并发送需要accessToken的请求
nodeWeixinAuth.determine(app, function () {
  //这里添加发送请求的代码
});



//与微信对接服务器的验证
var errors = require('web-errors').errors;
var request = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');

var server = express();

server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());

server.post('/weixin/ack', function (req, res) {
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

```


## License

MIT © [JSSDKCN](blog.3gcnbeta.com)


[npm-image]: https://badge.fury.io/js/node-weixin-auth.svg
[npm-url]: https://npmjs.org/package/node-weixin-auth
[travis-image]: https://travis-ci.org/JSSDKCN/node-weixin-auth.svg?branch=master
[travis-url]: https://travis-ci.org/JSSDKCN/node-weixin-auth
[daviddm-image]: https://david-dm.org/JSSDKCN/node-weixin-auth.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/JSSDKCN/node-weixin-auth
