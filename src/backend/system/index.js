'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const O = require('../omikron');
const config = require('../config');

const system = {
  async update(){
    log(config.updateScript);
    // https.get()
  },

  async init(){

  },
};

module.exports = system;