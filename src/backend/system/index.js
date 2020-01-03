'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');
const update = require('./update');
const init = require('./init');

module.exports = {
  update,
  init,
}