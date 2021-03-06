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
  'processArgsPassThrough' : function (test) {
    // Check that the image processing options for phantomjs pass through
    var data = configuration.processArgs(['asd', 'qwe', 'before', 'file://test.html', '--random-flag', '--another-random-flag', '--random-value=womble']);

    test.equal(data.mode, 'before');
    test.notEqual(data.raw_options.indexOf('--another-random-flag'), -1, 'Flag not passed through to .raw_options');
    test.notEqual(data.raw_options.indexOf('--random-flag'), -1, 'Flag not passed through to .raw_options');
    test.equal(data.options.random_flag, true, 'Flag not passed through to .options');
    test.equal(data.options.random_value, 'womble', 'Value not passed through to .options');
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
  },
  'processArgsCompareMode' : function (test) {
    var data = configuration.processArgs(['node', 'script', 'http://site.one.com', 'http://site.two.com', '--flag', '--value=x']);
    test.equal(data.mode, 'compare', 'Did not go into compare mode');
    test.equal(data.url, 'http://site.one.com', 'Did not get first URL');
    test.notEqual(data.raw_options.indexOf('--url2=http://site.two.com'), -1, 'Did not get second URL');
    test.equal(data.options.flag, true, 'Did not get flag');
    test.equal(data.options.value, 'x', 'Did not get value');
    test.done();
  },
  'getProcessingOptions' : function (test) {
    var result = configuration.getProcessingOptions({'hide_before_and_after': true, 'output_dir': "output/directory"});
    test.notEqual(result.indexOf('--hide-before-and-after'), -1, 'getProcessingOptions not passing boolean values through');
    test.equal(result.indexOf('--after-dir'), -1, 'getProcessingOptions passing through undefined values');
    test.notEqual(result.indexOf('--output-dir=output/directory'), -1, 'getProcessingOptions not passing through string and numeric values');
    test.done();
  }
};
