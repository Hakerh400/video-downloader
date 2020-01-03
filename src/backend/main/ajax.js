'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');

const opts = {
  url: '',
  ffmpeg: 'C:/Program Files/ffmpeg/bin/original/ffmpeg.exe',
};

const ajax = {
  async getOpts(){
    return opts;
  },
};

module.exports = ajax;