'use strict';

const config = require('@/src/backend/config');

const localIP = '127.0.0.1';
const localPort = '8082';

const LS = require('./local-strings');

const reqSem = new O.Semaphore(1);

const main = async () => {
  O.addStyle(`/projects/${O.project}/style.css`);

  const content = O.ceDiv(O.body, 'content');
  const sectsElem = O.ceDiv(content, 'sections');

  const sects = O.obj();

  let optsElem = null;

  const sectsState = await req('getSectsState');
  const opts = await req('getOpts');

  const addSect = name => {
    const sect = O.ce(sectsElem, 'details', 'section');

    sects[name] = sect;
    if(sectsState[name]) sect.open = 1;

    const title = O.ce(sect, 'summary', 'section-title');
    O.ceText(title, LS.sections[name]);

    optsElem = O.ceDiv(sect, 'options');

    O.ael(sect, 'toggle', () => {
      req('updateSectState', {
        name,
        value: sect.open | 0,
      }).catch(error);
    });
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

      req('updateOpt', {
        name,
        value: input.value,
      }).then(updateCmd).catch(error);
    });
  };

  const addOpts = (title, opts) => {
    addSect(title);

    for(const opt of opts)
      addOptStr(opt);
  };

  addOpts('basic', [
    'url',
    'dest',
    'format',
    'outputPattern',
  ]);

  addOpts('advanced', [
    'retries',
    'fragmentRetries',
    'ffmpeg',
  ]);
  
  addSect('cmdLine');
  const cmdLine = addOpt('cmdLine');
  const cmdLineElem = O.ceDiv(cmdLine, 'pre');
  const cmdOpts = addOpt('cmdOpts');
  const cmdOptsElem = O.ceDiv(cmdOpts, 'pre');

  const updateCmd = () => req('getCmdData').then(data => {
    cmdLineElem.innerText = data.cmdLine;
    cmdOptsElem.innerText = data.cmdOpts;
  });

  await updateCmd();
};

const req = (type, data=null) => reqSem.wait().then(() => new Promise((res, rej) => {
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
})).finally(() => reqSem.signal());

const error = err => {
  O.error(err);
};

main().catch(error);