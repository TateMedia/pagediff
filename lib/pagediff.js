#!/usr/bin/env node

var args = process.argv.slice(2); // Copies arguments list but removes first two options (script exec type & exec location)

if (args.length != 2) {
  console.error('Requires two arguments: before|after <url>');
  process.exit(1);
}

var shell            = require('child_process').execFile;
var phantomjs        = require('phantomjs').path;
var scriptToExecute  = __dirname + '/phantom.js';

shell(phantomjs, ['--ignore-ssl-errors=true', '--web-security=false', scriptToExecute ,args[0], args[1]], function(err, stdout, stderr) {
  if (stdout) console.log(stdout);
  if (stderr) console.log(stderr);
  if (err) {
    console.log(err);
    throw err;
  }
});