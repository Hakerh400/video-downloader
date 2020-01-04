'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const O = require('../omikron');
const data = require('../data');
const app = require('./main');

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
    const exe = opts['youtube-dl'];
    const args = [];

    const push = (arg1, arg2=null) => {
      if(arg2 === null){
        if(arg1 !== '') args.push(arg1);
        return;
      }

      if(arg2 !== '') args.push(arg1, arg2);
    };

    push('-f', opts.format);
    push('-o', opts.outputPattern);
    push('--retries', opts.retries);
    push('--fragment-retries', opts.fragmentRetries);
    push('--ffmpeg-location', opts.ffmpeg);
    push(opts.url);

    const options = {
      cwd: opts.dest,
    };

    return {exe, args, options};
  },

  async download(){
    const cmdData = await ajax.getCmdData();

    log.inc(`Spawning process: ${JSON.stringify(cmdData)}`);
    const proc = cp.spawn(cmdData.exe, cmdData.args, cmdData.options);
    const {pid} = proc;
    log.dec(`Spawned process with PID ${pid}`);

    const logProc = msg => {
      log(`Process with PID ${pid} ${msg}`);
    };

    proc.stdout.on('data', data => {
      logProc(`wrote to stdout: ${JSON.stringify(data.toString())}`);
    });

    proc.stderr.on('data', data => {
      logProc(`wrote to stderr: ${JSON.stringify(data.toString())}`);
    });

    proc.on('exit', exitCode => {
      logProc(`exited with code: ${exitCode}`);
    });
  },

  async exit(){
    app.exit();
  },
};

module.exports = ajax;