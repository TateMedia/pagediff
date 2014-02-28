

var connect = require('connect')
  , scan_dir = require('./scan-dir');

var server = connect.createServer();

exports.listen = function (directory, port) {
  if (port === undefined) {
    port = 8000;
  }
  server.use(connect.logger('dev'));
  server.use(scan_dir(directory));
  server.use(connect.static(directory));
  server.listen(port);
}

