'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');
const config = require('../config');
const data = require('./data-default-raw');

data.opts.dest = path.normalize(
  data.opts.dest.replace(/%([^%]+)%/g, (a, b) => {
    return process.env[b];
  })
);

module.exports = data;