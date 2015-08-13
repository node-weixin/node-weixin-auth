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

```


## License

MIT © [JSSDKCN](blog.3gcnbeta.com)


[npm-image]: https://badge.fury.io/js/node-weixin-auth.svg
[npm-url]: https://npmjs.org/package/node-weixin-auth
[travis-image]: https://travis-ci.org/JSSDKCN/node-weixin-auth.svg?branch=master
[travis-url]: https://travis-ci.org/JSSDKCN/node-weixin-auth
[daviddm-image]: https://david-dm.org/JSSDKCN/node-weixin-auth.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/JSSDKCN/node-weixin-auth
