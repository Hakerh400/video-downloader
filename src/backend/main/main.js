'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const querystring = require('querystring');
const O = require('../omikron');
const config = require('../config');
const readline = require('../readline');
const system = require('../system');
const data = require('../data');
const ajax = require('./ajax');

const frontendDir = path.join(config.dirs.root, 'src/frontend');

let httpServer = null;
let ajaxServer = null;
let rl = null;

const main = async () => {
  log(`Video downloader version ${config.package.version}`);

  log.inc('Checking for updates');
  await system.update();
  log.dec('Application is up-to-date');

  log.inc('Initializing system');
  await system.init();
  log.dec('System is initialized');

  log.inc('Creating static HTTP server');
  httpServer = http.createServer(onHttpReq);
  httpServer.listen(config.httpPort);
  log.dec(`Server is listening on port ${config.httpPort}`);

  log.inc('Creating AJAX server');
  ajaxServer = http.createServer(onAjaxReq);
  ajaxServer.listen(config.ajaxPort);
  log.dec(`Server is listening on port ${config.ajaxPort}`);

  log.inc('Starting readline interface');
  rl = readline.rl();
  log.dec('Readline interface is created');

  log('Application is ready to use');

  askForInput();
};

const askForInput = () => {
  rl.question('', str => {
    (async () => {
      await onInput(str);
      if(rl !== null) askForInput();
    })().catch(log);
  });
};

const onInput = async str => {
  str = str.trim();

  if(str === '') return;

  if(/^q$/i.test(str)){
    log.inc('Preparing to close application');

    log.inc('Closing readline interface');
    rl.close();
    rl = null;
    log.dec('Readline interface is closed');

    log.inc('Closing static HTTP server');
    httpServer.close();
    httpServer = null;
    log.dec('Server is closed');

    log.inc('Closing AJAX server');
    ajaxServer.close();
    ajaxServer = null;
    log.dec('Server is closed');

    log.dec('Terminating the process');
    return;
  }

  log('Unknown command');
};

const onHttpReq = (req, res) => {
  setHeaders(res);

  const url = new URL(`http://localhost${req.url}`);
  const urlPath = url.pathname.slice(1);

  const pth = urlPath.startsWith('@') ?
    path.join(config.dirs.root, urlPath.slice(1)) :
    path.join(frontendDir, urlPath);

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

  const found = send(pth);
  if(!found) e404();

  log('GET', JSON.stringify([
    req.url,
    pth,
    res.statusCode,
  ]));
};

const onAjaxReq = (req, res) => {
  setHeaders(res);

  const bufs = [];

  req.on('data', buf => bufs.push(buf));

  req.on('end', () => {
    const json = JSON.parse(Buffer.concat(bufs).toString());
    const {type, data} = json;
    const result = {data: null, err: null};

    log.inc(`Request: ${JSON.stringify(json)}`);

    ajax[type](data).then(data => {
      if(data !== undefined)
        result.data = data;
    }, err => {
      if(typeof err !== 'string')
        error(err);

      result.err = err;
    }).finally(() => {
      log.dec(`Response: ${JSON.stringify(result)}`);
      res.end(JSON.stringify(result));
    });
  });
};

const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
};

const error = err => {
  process.exitCode = 1;
  O.exit(err);
};

main().catch(error);