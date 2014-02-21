"use strict";

var configuration = require('../lib/configuration');

module.exports = {
  'processArgs' : function (test) {
    var data = configuration.processArgs();
    test.equal(data.mode, 'help', 'Did not go into help mode with no args');

    data = configuration.processArgs(['asd']);
    test.equal(data.mode, 'help', 'Did not go into help mode with one args');

    data = configuration.processArgs(['asd', 'qwe']);
    test.equal(data.mode, 'help', 'Did not go into help mode with two args');

    data = configuration.processArgs(['asd', 'qwe', 'ert']);
    test.equal(data.mode, 'help', 'Did not go into help mode with three invalid args');

    data = configuration.processArgs(['asd', 'qwe', 'before']);
    test.equal(data.mode, 'help', 'Did not go into help mode with three invalid args');

    data = configuration.processArgs(['asd', 'qwe', 'after']);
    test.equal(data.mode, 'help', 'Did not go into help mode with three invalid args');

    data = configuration.processArgs(['asd', 'qwe', 'before', 'xxxx://www.google.co.uk']);
    test.equal(data.mode, 'help', 'Did not go into help mode with invalid protocol');
    test.equal(data.message.substring(0, 7), 'Invalid', 'Did not mention that the protocol was the problem');

    data = configuration.processArgs(['asd', 'qwe', 'before', 'http://www.google.co.uk']);
    test.equal(data.mode, 'before', 'Did not go into before mode for http');
    data = configuration.processArgs(['asd', 'qwe', 'before', 'https://www.google.co.uk']);
    test.equal(data.mode, 'before', 'Did not go into before mode for https');
    data = configuration.processArgs(['asd', 'qwe', 'before', 'file://test.html']);
    test.equal(data.mode, 'before', 'Did not go into before mode for file');
    test.done();
  },
  'processArgsFileNonExistent' : function (test) {
    var data = configuration.processArgs(['node', 'script', '--config=non-existent.txt']);
    test.equal(data.mode, 'help', 'Did not go into help mode for a non-existent file');
    test.equal(data.message.substring(0, 11), 'Config file', 'Did not mention that the config file was the problem');
    test.done();
  },
  'processArgsFileInvalid' : function (test) {
    var data = configuration.processArgs(['node', 'script', '--config=' + __dirname + '/config.test.invalid.txt']);
    test.equal(data.mode, 'help', 'Did not go into help mode for an invalid file');
    test.equal(data.message.substring(0, 11), 'Config file', 'Did not mention that the config file was the problem');

    data = configuration.processArgs(['node', 'script', '--config=' + __dirname + '/config.test.invalid.json']);
    test.equal(data.mode, 'help', 'Did not go into help mode for an invalid file');
    test.equal(data.message.substring(0, 11), 'Config file', 'Did not mention that the config file was the problem');
    test.done();
  },
  'processArgsFileValid' : function (test) {
    var data = configuration.processArgs(['node', 'script', '--config=' + __dirname + '/config.test.json']);
    test.equal(data.mode, 'batch', 'Did not go into batch mode');
    test.equal(data.message, undefined);
    test.done();
  }
};

