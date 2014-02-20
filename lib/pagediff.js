#!/usr/bin/env node

"use strict";

var config = {'mode':'invalid', 'size': [1024,768]};

function helpandexit() {
  var fs = require('fs');
  var data = fs.readFileSync(__dirname + '/help.txt', 'utf8');
  console.error(data);
  process.exit(1);
}

function readConfig(file) {
  var fs = require('fs');
  var data = fs.readFileSync(file, 'utf8');
  
  data = JSON.parse(data);
                     
  console.dir(data);

  return data;
}

function processArgs() {
  var args = process.argv.slice(2); // Copies arguments list but removes first two options (script exec type & exec location)
  for (var i = 0; i < args.length; i++) {
    var re = /--([a-z])(=(.+))?/
    var kv = args[i].match(re);
    if (kv == null) {
      if ((args[i] != 'before' && args[i] != 'after') || i == args.length - 1) {
        helpandexit();
      }
      config['mode'] = args[i];
      config['url'] = args[i+1];
      break;
    } else {
      if (kv[1] == 'config') {
        // --config=<config file>
        data = readConfig(kv[3]);
        for(item in data) {
          config[item] = data[item];
        }
      } else if (kv[1] == 'help') {
        helpandexit();
      } else {
        switch(kv[1]) {
          case 'size':
            config['size'] = kv[3].split('x'); 
            break;
          default:
            config[kv[1]] = kv[3];
        }
      }
    }
  }
  if (config['mode'] == 'invalid') {
    helpandexit();
  }
}

var shell            = require('child_process').execFile;
var phantomjs        = require('phantomjs').path;

function run(cmd, url, width, height) {
  var scriptToExecute  = __dirname + '/phantom.js';
  shell(phantomjs, 
    ['--ignore-ssl-errors=true', '--web-security=false', scriptToExecute ,cmd, url, width + 'x' + height], 
    function(err, stdout, stderr) {
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      if (err) {
        console.log(err);
        throw err;
      }
    }
  );
}

processArgs();

// Is this simple mode
if (config['mode'] == 'before' || config['mode'] == 'after') {
  run(config['mode'], config['url'], config['size'][0], config['size'][1]);
} else {
// Deal with batch processing
  for (i = 0; i < config['batches'].length; i++) {
    var batch = config['batches'][i];

    // See if batch overrides default size
    if (batch['size'] == undefined) {
      run(batch['mode'], batch['url'], config['size'][0], config['size'][1]);
    } else {
      run(batch['mode'], batch['url'], batch['size']);
    }
  }
}

