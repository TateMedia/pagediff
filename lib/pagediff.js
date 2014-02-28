#!/usr/bin/env node

"use strict";

var shell                = require('child_process').execFile;
var phantomjs            = require('phantomjs').path;
var config               = require('./configuration.js').processArgs(process.argv);
var getProcessingOptions = require('./configuration.js').getProcessingOptions;
var server               = require('./server');

console.dir(config);

/*
 * Runs phantomjs to grab a webpage image and, if it's the after image, compare
 * it to the before image.
 *
 * A batch object must contain:
 * batch.url      file:// http:// or https://
 * batch.size     Two element array (width, height)
 * batch.cmd      'before' or 'after'
 *
 * Optionally:
 * batch.options  Array of commandline arguments to pass on.
 */
function processBatch(batch, options_in) {
  var scriptToExecute  = __dirname + '/phantom.js';
  var options = ['--ignore-ssl-errors=true', '--web-security=false', scriptToExecute ,batch.cmd, batch.url, batch.size[0] + 'x' + batch.size[1]];

  if (options_in !== undefined) {
    options = options.concat(options_in);
  }
  console.dir(options);
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

function main() {
  // Is this simple mode
  if (config.mode == 'before' || config.mode == 'after') {

    var batch = {};
    batch.cmd = config.mode;
    batch.url = config.url;
    batch.size = config.size;
    processBatch(batch, config.options);

  } else if (config.mode === 'batch') {

    // Deal with batch processing
    var batch;
    for (var i = 0; i < config.batches.length; i++) {
      batch = config.batches[i];

      // See if batch overrides default size
      if (batch.size === undefined) {
        batch.size = config.size;
      }
      processBatch(batch, getProcessingOptions(batch));
    }

  } else if (config.mode == 'server') {

    server.listen(process.cwd() + '/output', 8000, config.options);

  } else if (config.mode == 'help') {

    require('./configuration.js').help(config.message);
    process.exit(1);

  }
}

main();
