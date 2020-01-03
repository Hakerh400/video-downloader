'use strict';

const path = require('path');
const O = require('../omikron');
const config = require('./config');

const dirs = config.dirs = O.obj();

const cwd = __dirname;
dirs.root = path.join(cwd, '../../..');
dirs.data = path.join(dirs.root, 'data');

config.package = require(path.join(dirs.root, 'package.json'));
config.updateScript = path.join(config.package.homepage, 'update.js');

module.exports = config;