'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');
const config = require('../config');
const download = require('../download');
const hash = require('../hash');

module.exports = async () => {
  log.inc(`Downloading update script`);
  const script = await download(config.updateScript);
  log.dec(`Received update script with SHA-1 ${hash(script, 'sha1', 'hex')}`);

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
};