#!/usr/bin/env node

"use strict";

var shell            = require('child_process').execFile;
var phantomjs        = require('phantomjs').path;
var config           = require('./configuration.js').processArgs(process.argv);

function processBatch(batch) {
  var scriptToExecute  = __dirname + '/phantom.js';
  var options = ['--ignore-ssl-errors=true', '--web-security=false', scriptToExecute ,batch.cmd, batch.url, batch.size[0] + 'x' + batch.size[1]];
  
  if (batch.hide_before_and_after) {
    options.push('--hide-before-and-after');
  }
  /*
  if (batch.bounding_box) {
    options.push('--bounding-box');
  }
  */
  if (batch.threshold) {
    options.push('--threshold=' + batch.threshold);
  }
  shell(phantomjs,
    options,
    function(err, stdout, stderr) {
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      if (err) {
        console.error(err);
        throw err;
      }
    }
  );
}

// Is this simple mode
if (config.mode == 'before' || config.mode == 'after') {
  var batch = {};
  batch.cmd = config.mode;
  batch.url = config.url;
  batch.size = config.size;
  if (config.hide_before_and_after) {
    batch.hide_before_and_after = true;
  }
  if (config.threshold) {
    batch.threshold = config.threshold;
  }
  processBatch(batch);
} else if (config.mode === 'batch') {
  // Deal with batch processing
  for (var i = 0; i < config.batches.length; i++) {
    var batch = config.batches[i];
    
    // See if batch overrides default size
    if (batch.size === undefined) {
      batch.size = config.size;
    }

    processBatch(batch);
  }
} else if (config.mode == 'help') {
  require('./configuration.js').help(config.message);
  process.exit(1);
}
