#!/usr/bin/env node

"use strict";

var shell            = require('child_process').execFile;
var phantomjs        = require('phantomjs').path;
var config           = require('./configuration.js').processArgs(process.argv);

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

// Is this simple mode
if (config.mode == 'before' || config.mode == 'after') {
  run(config.mode, config.url, config.size[0], config.size[1]);
} else if (config.mode === 'help') {
  require('./configuration.js').help(config.message);
  process.exit(1);
} else {
// Deal with batch processing
  for (var i = 0; i < config.batches.length; i++) {
    var batch = config.batches[i];

    // See if batch overrides default size
    if (batch.size === undefined) {
      run(batch.mode, batch.url, config.size[0], config.size[1]);
    } else {
      run(batch.mode, batch.url, batch.size);
    }
  }
}

