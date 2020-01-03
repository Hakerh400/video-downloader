'use strict';

const config = require('@/src/backend/config');

const localIP = '127.0.0.1';
const localPort = '8082';

const LS = require('./local-strings');

const main = async () => {
  O.addStyle('style.css');

  const content = O.ceDiv(O.body, 'content');
  const sectsElem = O.ceDiv(content, 'sections');

  const sects = O.obj();

  let optsElem = null;

  const opts = await req('getOpts');
  const sectsState = await req('getSectsState');

  const addSect = name => {
    const sect = O.ce(sectsElem, 'details', 'section');

    sects[name] = sect;
    if(sectsState[name]) sect.open = 1;

    const title = O.ce(sect, 'summary', 'section-title');
    O.ceText(title, LS.sections[name]);

    optsElem = O.ceDiv(sect, 'options');
  };

  const addOpt = name => {
    const elem = O.ceDiv(optsElem, 'option');

    const descElem = O.ceDiv(elem, 'option-desc');
    O.ceText(descElem, LS.options[name]);

    const val = O.ceDiv(elem, 'option-value');

    return val;
  };

  const addOptStr = name => {
    const elem = addOpt(name);

    const input = O.ce(elem, 'input', 'option-str');
    input.type = 'text';
    input.value = opts[name];

    O.ael(input, 'change', evt => {
      opts[name] = input.value;
      updateCmd();
    });
  };

  addSect('basic');
  addOptStr('url');
  addOptStr('dest');
  
  addSect('advanced');
  addOptStr('ffmpeg');

  addSect('cmdLine');
  const cmdLine = addOpt('cmdLine');
  const cmdLineElem = O.ceDiv(cmdLine, 'pre');
  const cmdOpts = addOpt('cmdOpts');
  const cmdOptsElem = O.ceDiv(cmdOpts, 'pre');
  
  const updateCmd = () => {
    const args = [];

    args.push('youtube-dl');
    args.push('--ffmpeg-location', opts.ffmpeg);
    args.push(opts.url);

    cmdLineElem.innerText = args.map(arg => {
      if(arg === '' || /[^a-zA-Z0-9\-_]/.test(arg)) arg = `"${arg}"`;
      return arg;
    }).join(' ');

    cmdOptsElem.innerText = JSON.stringify({
      cwd: opts.dest,
    });
  };

  updateCmd();
};

const req = (type, data) => new Promise((res, rej) => {
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    if(xhr.readyState === 4){
      if(xhr.status !== 200)
        return rej(new Error(`Status code ${xhr.status}`));

      const json = JSON.parse(xhr.responseText);

      if(json.err !== null)
        return rej(new Error(json.err));

      res(json.data);
    }
  };

  xhr.open('POST', `http://${localIP}:${localPort}/`);
  xhr.send(JSON.stringify({type, data}));
});

main();