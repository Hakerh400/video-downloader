'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');
const config = require('../config');

const configFile = path.join(config.dirs.data, 'config.json');

const data = require(
  fs.existsSync(config.dirs.data) ?
    path.join(config.dirs.data, 'config') : './data-default'
);

data.update = () => {
  log.inc(`Exporting configuration data to ${O.sf(configFile)}`);
  O.wfs(configFile, O.sf(data));
  log.dec('Data is exported');
};

module.exports = data;