#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

微信服务器Auth模块是([node-weixin-api](https://github.com/node-weixin/node-weixin-api) 或者 [node-weixin-express](https://github.com/node-weixin/node-weixin-express))的一个子项目。
它提供了几个重要的方法

  tokenize： 用于跟服务器验证配置信息
  
  determine:  用于自动tokenize所有的api请求，而不需要手动在超时时重新请求
  
  ips:  获取服务IP列表
  
  ack: 用于服务器有效性验证
  
交流QQ群: 39287176

注:

 [node-weixin-express](https://github.com/node-weixin/node-weixin-express)是基于node-weixin-*的服务器端参考实现。

 [node-weixin-api](https://github.com/node-weixin/node-weixin-api)是基于node-weixin-*的API接口SDK。

 它们都是由下列子项目组合而成:

 1. [node-weixin-config](https://github.com/node-weixin/node-weixin-config)
    用于微信配置信息的校验,
    
 2. [node-weixin-auth](https://github.com/node-weixin/node-weixin-auth)
    用于与微信服务器握手检验

 3. [node-weixin-util](https://github.com/node-weixin/node-weixin-util)
    一些常用的微信请求，加密，解密，检验的功能与处理

 4. [node-weixin-request](https://github.com/node-weixin/node-weixin-request)
    微信的各类服务的HTTP请求的抽象集合

 5. [node-weixin-oauth](https://github.com/node-weixin/node-weixin-oauth)
    微信OAuth相关的操作

 6. [node-weixin-pay](https://github.com/node-weixin/node-weixin-pay)
    微信支付的服务器接口

 7. [node-weixin-jssdk](https://github.com/node-weixin/node-weixin-jssdk)
    微信JSSDK相关的服务器接口

 8. [node-weixin-menu](https://github.com/node-weixin/node-weixin-menu)
    微信菜单相关的操作与命令

## Install

```sh
$ npm install --save node-weixin-auth
```


## Usage

```js


var nodeWeixinAuth = require('node-weixin-auth');

var app = {
  id: '',
  secret: '',
  token: ''
};

//手动得到accessToken
nodeWeixinAuth.tokenize(app, function (error, json) {
  var accessToken = json.access_token;
});

//自动获得accessToken，并发送需要accessToken的请求
nodeWeixinAuth.determine(app, function () {
  //这里添加发送请求的代码
});

//获取服务器IP
nodeWeixinAuth.ips(app, function (error, data) {
  //error == false
  //data.ip_list获取IP列表
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
  var data = nodeWeixinAuth.extract(req.body);
  nodeWeixinAuth.ack(app.token, data, function (error, data) {
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

MIT © [node-weixin](blog.3gcnbeta.com)


[npm-image]: https://badge.fury.io/js/node-weixin-auth.svg
[npm-url]: https://npmjs.org/package/node-weixin-auth
[travis-image]: https://travis-ci.org/node-weixin/node-weixin-auth.svg?branch=master
[travis-url]: https://travis-ci.org/node-weixin/node-weixin-auth
[daviddm-image]: https://david-dm.org/node-weixin/node-weixin-auth.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/node-weixin/node-weixin-auth
