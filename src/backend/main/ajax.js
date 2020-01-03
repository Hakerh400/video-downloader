'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');
const data = require('../data');

const {sectsState, opts} = data;

const ajax = {
  async getSectsState(){
    return sectsState;
  },

  async getOpts(){
    return opts;
  },

  async updateSectState(d){
    sectsState[d.name] = d.value;
    data.update();
  },

  async updateOpt(d){
    opts[d.name] = d.value;
    data.update();
  },

  async getCmdData(){
    const args = [];

    const push = (arg1, arg2=null) => {
      if(arg2 === null){
        if(arg1 !== '') args.push(arg1);
        return;
      }

      if(arg2 !== '') args.push(arg1, arg2);
    };

    push('youtube-dl');
    push('-f', opts.format);
    push('-o', opts.outputPattern);
    push('--retries', opts.retries);
    push('--fragment-retries', opts.fragmentRetries);
    push('--ffmpeg-location', opts.ffmpeg);
    push(opts.url);

    const cmdLine = args.map(arg => {
      if(arg === '' || /[^a-zA-Z0-9\-_]/.test(arg)) arg = `"${arg}"`;
      return arg;
    }).join(' ');

    const cmdOpts = JSON.stringify({
      cwd: opts.dest,
    });

    return {cmdLine, cmdOpts};
  },
};

module.exports = ajax;