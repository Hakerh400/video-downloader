'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');
const config = require('../config');
const data = require('../data');
const download = require('../download');
const hash = require('../hash');

const {dirs, deps} = config;

module.exports = async () => {
  const dataDir = dirs.data;

  if(fs.existsSync(dataDir)){
    log('Nothing to be done');
    return;
  }

  log.inc(`Creating directory ${O.sf(dataDir)}`);
  fs.mkdirSync(dataDir);
  log.dec('Directory is created');

  const ffmpegPath = path.join(dataDir, 'ffmpeg.exe');
  const ytdlPath = path.join(dataDir, 'youtube-dl.exe');

  log.inc('Downloading youtube-dl');
  await download(deps['youtube-dl'], ytdlPath);
  log.dec('Download finished');

  log.inc('Downloading FFmpeg');
  await download(deps.ffmpeg, ffmpegPath);
  log.dec('Download finished');

  log.inc('Initializing default data configuration');
  log(`Raw configuration: ${JSON.stringify(data)}`);

  log.inc(`Configuring youtube-dl path ${O.sf(ytdlPath)}`);
  data.opts['youtube-dl'] = ytdlPath;
  log.dec();

  log.inc(`Configuring FFmpeg path ${O.sf(ffmpegPath)}`);
  data.opts.ffmpeg = ffmpegPath;
  log.dec();

  log(`Final configuration: ${JSON.stringify(data)}`);
  data.update();
  log.dec('Configuration is initialized');
};