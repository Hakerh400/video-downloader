'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const O = require('../omikron');
const config = require('../config');
const hash = require('../hash');

const system = {
  async update(){
    const script = await new Promise((res, rej) => {
      https.get(config.updateScript, response => {
        const bufs = [];

        response.on('data', buf => bufs.push(buf));

        response.on('end', () => {
          if(response.statusCode !== 200)
            return rej(new Error(`Status code ${response.statusCode}`));

          res(Buffer.concat(bufs).toString());
        });

        response.on('error', rej);
      }).on('error', rej);
    });

    log(`Received update script: ${hash(script, 'sha1', 'hex')}`);

    log('Constructing update module');
    const moduleObj = {exports: {}};
    const moduleFunc = new Function('module', script);

    log.inc('Invoking update module');
    moduleFunc(moduleObj);
    const func = moduleObj.exports;
    log.dec(`Update module exported a value of type ${O.sf(typeof func)}`);

    log.inc('Invoking update function');
    const result = await func(moduleObj);
    log.dec(`Update function returned ${O.sf(result)}`);
  },

  async init(){

  },
};

module.exports = system;