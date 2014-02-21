"use strict";


function readConfig(file, config) {

  var data, item;

  try {
    data = require('fs').readFileSync(file, 'utf8');
    data = JSON.parse(data);
  } catch (e) {
    return false;
  }

  for (item in data) {
    if (['size', 'batches'].indexOf(item) !== -1) {
      config[item] = data[item];
    } else {
      console.error('Invalid key "' + item + '" in config file');
      return false;
    }
  }
  if (config.batches !== undefined) {
    config.mode = 'batch';
  }
  return config;
}

exports.help = function (msg) {
  var data = require('fs').readFileSync(__dirname + '/help.txt', 'utf8');
  console.error(msg);
  console.error(data);
};

exports.processArgs = function (argv) {
  var config = {'mode': 'invalid', 'size': [1024, 768]};

  if (argv === undefined || argv.length === undefined || argv.length < 2) {
    return {'mode': 'help'};
  }

  argv = argv.slice(2);// Copies arguments list but removes first two options (script exec type & exec location)
  var i, re, kv, data, item;

  for (i = 0; i < argv.length; i++) {
    re = /--([a-z]+)(=(.+))?/;
    kv = argv[i].match(re);

    if (kv === null) {
      if ((argv[i] !== 'before' && argv[i] !== 'after') || i === argv.length - 1) {
        return {'mode': 'help'};
      }
      config.mode = argv[i];
      config.url = argv[i + 1];
      if (null === config.url.match(/(http|https|file):\/\/.+/)) {
        config.mode = 'help';
        config.message = 'Invalid protocol. Needs to be http:// https:// or file://';
      }
      break;
    } else {
      switch (kv[1]) {
      case 'config':
        // --config=<config file>
        config = readConfig(kv[3], config);
        if (config === false) {
          return {
            'mode': 'help',
            'message': 'Config file does not exist, is not readable, or is not valid JSON.'
          };
        }
        break;
      case 'help':
        return {'mode': 'help'};
      case 'size':
        config.size = kv[3].split('x');
        break;
      default:
        config[kv[1]] = kv[3];
        break;
      }
    }
  }
  if (config.mode === 'invalid') {
    config.mode = 'help';
  }
  return config;
};

