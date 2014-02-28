"use strict";

var connect = require('connect'),
  scan_dir = require('./scan-dir');

var server = connect.createServer();

/**
 * Creates the webserver
 *
 * Options:
 *  - port {number}  Port to listen on
 *  - head {string}  File to use to replace the <head> tag contents
 *
 * @param {string} directory  Directory to scan
 * @param {object} options    Options
 */
exports.listen = function (directory, options) {
  if (options === undefined) {
    options = {};
  }
  if (options.port === undefined) {
    options.port = 8000;
  }
  if (options.head === undefined) {
    options.head = __dirname + '/head.html';
  }

  server.use(connect.logger('dev'));
  server.use(scan_dir(directory, options));
  server.use(connect.static(directory));

  console.log("Listening on port " + options.port);
  server.listen(options.port);
};
