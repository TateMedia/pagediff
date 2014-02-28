"use strict";

function verifyBatch(batch) {
  // Check sizes
  if (batch.size !== undefined) {
    if (batch.size.length !== 2) {
      console.error('Size needs both height and width');
      return false;
    }
    if (isNaN(parseInt(batch.size[0], 10)) || isNaN(parseInt(batch.size[1]), 10)) {
      console.error('Width and height need to be a number');
      return false;
    }
  }
  if (batch.url === undefined) {
    console.error("Batch needs a url");
    return false;
  }
  if (null === batch.url.match(/(http|https|file):\/\/.+/)) {
    console.error("URL needs to start with file:// http:// or https://");
    return false;
  }
  if (batch.cmd === undefined) {
    console.error('cmd field in batch needs to be "before" or "after"');
    return false;
  }
  if (batch.cmd !== "before" && batch.cmd !== "after") {
    console.error('cmd field in batch needs to be "before" or "after"');
    return false;
  }
  return true;
}

function readConfig(file, config) {

  var data, item, b, i, batch;
  var option_keys = ['hide_before_and_after', 'output_dir', 'before_dir', 'after_dir', 'threshold'];

  try {
    data = require('fs').readFileSync(file, 'utf8');

    data = JSON.parse(data);
  } catch (e) {
    console.log(e.message);
    return false;
  }

  for (item in data) {
    if (option_keys.indexOf(item) !== -1 || item === 'size') {
      config[item] = data[item];
    } else if (item === 'batches') {
      for (b = 0; b < data.batches.length; b++) {

        batch = data.batches[b];

        // Check the batch is valid (better to die now)
        if (!verifyBatch(batch)) {
          console.error('Invalid batch at index ' + b);
          return false;
        }

        // Now create a processing_options array for this batch
        for (i = 0; i < option_keys.length; i++) {
          if (batch[option_keys[i]] === undefined) {
            batch[option_keys[i]] = config[option_keys[i]];
          }
        }
      }
      config.batches = data.batches;
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
  require('fs').readFile(__dirname + '/help.txt', 'utf8', function (err, data) {
    if (err) {
      console.error(err);
    }
    console.error(msg);
    console.error(data);
  });
};

exports.getProcessingOptions = function (config) {
  var option_keys = ['hide_before_and_after', 'output_dir', 'before_dir', 'after_dir', 'threshold'];
  var i, results = [];

  for (i = 0; i < option_keys.length; i++) {
    if (typeof config[option_keys[i]] === 'undefined') {
      continue;
    } else if (typeof config[option_keys[i]] === 'boolean') {
      results.push('--' + option_keys[i].replace(/_/g, '-'));
    } else {
      results.push('--' + option_keys[i].replace(/_/g, '-') + '=' + config[option_keys[i]]);
    }
  }
  return results;
};

exports.processArgs = function (argv) {
  var config = {
    'mode': 'help',
    'size': [1024, 768],
    'options': [],
    'raw_options': []
  };

  if (argv === undefined || argv.length === undefined || argv.length < 2) {
    return {'mode': 'help'};
  }
  argv = argv.slice(2);// Copies arguments list but removes first two options (script exec type & exec location)
  var i, re, kv;

  for (i = 0; i < argv.length; i++) {
    re = /--([a-z\-]+)(=(.+))?/;
    kv = argv[i].match(re);

    if (kv === null) { // Set mode
      if (config.mode !== 'help') { // If the mode is already set
        return {
          'mode': 'help',
          'message': 'Invalid command line options as ' + argv[i]
        };
      }

      config.mode = argv[i];
      if (argv[i] === 'before' || argv[i] === 'after') {
        if (i === argv.length - 1) {
          return {
            'mode': 'help',
            'message': 'Missing target URL or file'
          };
        }
        config.mode = argv[i];
        config.url = argv[i + 1];
        i++; // Move on past the url

        if (null === config.url.match(/(http|https|file):\/\/.+/)) {
          return {
            "mode": 'help',
            "message": 'Invalid protocol. Needs to be http:// https:// or file://'
          };
        }
      } else if (config.mode !== "server") {
        return {
          'mode': 'help',
          'message': 'Invalid command line mode ' + argv[i]
        };
      }
    } else if (kv[1] === 'config') { // Use config file
      if (config.mode === 'before' || config.mode === 'after') {
        return {
          'mode': 'help',
          'message': 'Cannot have a config file and a command line mode of "before" or "after".'
        };
      }
      // --config=<config file>
      config = readConfig(kv[3], config);
      if (config === false) {
        return {
          'mode': 'help',
          'message': 'Config file is invalid or not readable.'
        };
      }
    } else if (kv[1] === 'size') {
      config.size = kv[3].split('x');
    } else {
      // Store any unknown options
      config.raw_options.push(argv[i]);
      config.options[kv[1].replace(/\-/g, '_')] = kv[3] === undefined ? true : kv[3];
    }
  }
  //console.dir(config);
  //process.exit(1);
  return config;
};
