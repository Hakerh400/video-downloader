'use strict';

const {require} = module;

const fs = require('fs');
const path = require('path');
const O = require('omikron');
const config = require('../../../config');

const cwd = module.filename;
const mainDir = path.join(module.filename, '../../..');
const startDir = path.join(mainDir, '../../../..');
const startBatOld = path.join(startDir, 'start.bat');
const startBatNew = path.join(mainDir, 'start.bat');

module.exports = async () => {
  // const batContent = O.rfs(startBatNew);
  // O.wfs(startBatOld);
  return '...';
};