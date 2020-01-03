'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');

const opts = {
  url: '',
  dest: path.join(require('os').homedir(), 'Desktop'),
  ffmpeg: path.normalize('C:/Program Files/ffmpeg/bin/original/ffmpeg.exe'),
};

const sectsState = {
  basic: 1,
  advanced: 0,
  cmdLine: 0,
};

const ajax = {
  async getSectsState(){
    return sectsState;
  },

  async getOpts(){
    return opts;
  },
};

module.exports = ajax;