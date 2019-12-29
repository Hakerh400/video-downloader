'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const querystring = require('querystring');
const O = require('../omikron');
const config = require('../config');
const readline = require('../readline');
const ajax = require('./ajax');

const cwd = __dirname;
const rootDir = path.join(cwd, '../../www');

let httpServer = null;
let ajaxServer = null;
let rl = null;

const main = () => {
  httpServer = http.createServer(onHttpReq);
  httpServer.listen(config.httpPort);

  ajaxServer = http.createServer(onAjaxReq);
  ajaxServer.listen(config.ajaxPort);

  rl = readline.rl();
  rl.on('line', onInput);
};

const onInput = str => {
  str = str.trim();

  if(str === '') return;

  if(/^q$/i.test(str)){
    httpServer.close();
    ajaxServer.close();
    rl.close();
    httpServer = null;
    ajaxServer = null;
    rl = null;
    return;
  }

  log('Unknown command');
};

const onHttpReq = (req, res) => {
  setHeaders(res);

  const url = new URL(`http://localhost${req.url}`);
  const urlPath = url.pathname.replace(/!/g, '..');

  const e404 = () => {
    res.statusCode = 404;
    res.end('Page not found');
  };

  const send = pth => {
    if(!fs.existsSync(pth)) return 0;

    const stat = fs.statSync(pth);

    if(stat.isFile()){
      fs.createReadStream(pth).pipe(res);
      return 1;
    }

    if(!stat.isDirectory()) return 0;
    return send(path.join(pth, 'index.htm'));
  };

  const pth = path.join(rootDir, urlPath);
  if(!send(pth)) e404();
};

const onAjaxReq = (req, res) => {
  setHeaders(res);

  const bufs = [];

  req.on('data', buf => bufs.push(buf));

  req.on('end', () => {
    const json = JSON.parse(Buffer.concat(bufs).toString());
    const {type, data} = json;
    const result = {data: null, err: null};

    ajax[type](data).then(data => {
      result.data = data;
    }, err => {
      if(typeof err !== 'string'){
        result.err = serverError;
        return;
      }

      result.err = err;
    }).finally(() => {
      res.end(JSON.stringify(result));
    });
  });
};

const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
};

main();