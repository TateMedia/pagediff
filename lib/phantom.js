"use strict";

var fs           = require('fs');
var system       = require('system');
var args         = system.args;

var cmd = args[1];
var url = args[2];
var size = [1024, 768];

var directories = {
  'before' : fs.workingDirectory,
  'after' : fs.workingDirectory,
  'output' : fs.workingDirectory,
};

/*
  Call with:
  phantomjs --web-security=false phantom.js before <url>

  This will produce a png file with the name before-<url>-<width>x<height>.png

  phantomjs --web-security=false phantom.js after <url>

  This will produce a png file with the name after-<url>-<width>x<height>.png
  and a comparisson file with the name output-<url>-<width>x<height>.png

  The url will be sanitized to make it into a half-decent filename.
*/

// See if the size is overridden
if (args[3]) {
  var arr = args[3].match(/([0-9]+)x([0-9]+)/);
  if (arr === null) {
    quit("No valid size specified");
  }
  size = [ arr[1] , arr[2] ];
}

// Choose some sensible defaults
var processing_options = {
  "bounding" : false,
  "threshold" : 0,
  "hide_before_and_after" : false,
}

// Override defaults
if (args.length > 4) {
  var re = /--([a-z0-9\-]+)(=(.+))?/;

  for (var i = 4; i < args.length; i++) {
    var kv = args[i].match(re);

    if (kv !== null) {
      switch(kv[1]) {
        /*
        case '--bounding-box':
          config.bounding = true;
          break;
        */
        case 'output':
          processing_options.output = kv[3];
          break;
        case 'url2':
          processing_options.url2 = kv[3];
          break;
        case 'threshold':
          if (parseInt(kv[3]) !== NaN) {
            processing_options.threshold = parseInt(kv[3]);
          }
          break;
        case 'hide-before-and-after':
          processing_options.hide_before_and_after = true;
          break;
        case 'filter':
          processing_options.filter = kv[3];
          break;
        case 'before-dir':
          if (fs.isDirectory(kv[3]) && fs.isWritable(kv[3])) {
            directories.before = kv[3];
          } else {
            quit("Directory for before images (" + kv[3] + ") is not writable");
          }
          break;
        case 'after-dir':
          if (fs.isDirectory(kv[3]) && fs.isWritable(kv[3])) {
            directories.after = kv[3];
          } else {
            quit("Directory for after images (" + kv[3] + ") is not writable");
          }
          break;
        case 'output-dir':
          if (fs.isDirectory(kv[3]) && fs.isWritable(kv[3])) {
            directories.output = kv[3];
          } else {
            quit("Directory for output images (" + kv[3] + ") is not writable");
          }
          break;
      }
    }
  }
}

if (null === url.match(/(http|https|file):\/\/.+/)) {
  quit("URL must be a full http:// URL (or file:// for a local file)");
}

if (cmd == "before") {

  // Capture the before image and quit
  capture(url, size, 'before', function () {
    quit();
  });

} else if (cmd == "after") {

  // Check we have a before file to compare
  if (!fs.isFile(getFilename(url, size, 'before'))) {
    quit("No before file");
  }

  var output = getFilename(url, size, 'output');
  if (processing_options.output !== undefined) {
    output = directories.output + '/' + processing_options.output;
  }

  // Capture the after image
  capture(url, size, 'after', function () {
    // Compare it to the before image for the same url
    compare(
      url,
      getFilename(url, size, 'before'),
      getFilename(url, size, 'after'),
      output,
      size,
      processing_options
    );
  });
} else if (cmd == "compare") {
  var output = getFilename(url, size, 'output');
  if (processing_options.output !== undefined) {
    output = directories.output + '/' + processing_options.output;
  }
  capture(url, size, 'before', function () {
    capture(processing_options.url2, size, 'after', function () {
      compare(
        url,
        getFilename(url, size, 'before'),
        getFilename(processing_options.url2, size, 'after'),
        output,
        size,
        processing_options
      );
    });
  });
} else {
  // Help text.
  console.log("phantomjs --web-security=false phantom.js before <url> <options>");
  console.log("Where options are:");
  console.log("  --threshold=nn          Percentage of pixels needed before an output image is created. Default 0");
  console.log("  --hide-before-and-after Hide the before and after images in the output. Just show composite");
  console.log("  --before-dir=xxx        Directory to put the before image in.");
  console.log("  --after-dir=xxx         Directory to put the after image in.");
  console.log("  --output-dir=xxx        Directory to put the output image in.");
  console.log("  --output=xxx            Output filename to use. Overrides default auto-generated attempt.");
  console.log("  --filter=xxx            Filter function to use 'differ_green_red' or 'differ_super_red'.");
  console.log("  --url2=xxx              Second URL if it's a direct comparison.");
  quit();
}

/**
 * Quit with an optional message
 *
 * @param {string} msg  Message to return
 */
function quit(msg) {
  if (msg) {
    console.log(msg);
  }
  phantom.exit();
}

/**
 * Compare two images
 *
 * Options:
 *  - filter {string}  Which filter to use. differ_green_red differ_super_red
 *  - hide_before_and_after {boolean}  Only output composite image
 *  - threshold {number} Percentage of pixels that need to be different to
 *                       trigger output image.
 *
 * @param {string} url  The url that is being worked on. Used as a title
 * @param {string} before_filename
 * @param {string} after_filename
 * @param {string} output_filename
 * @param {array} size   Two dimensional array of numbers. width, height.
 * @param {object} options
 */
function compare(url, before_filename, after_filename, output_filename, size, options) {
  var page = require('webpage').create();

  page.viewportSize = { width: size[0], height : size[1] };
  page.content = '<html>\
  <body> \
  <h1 style="font-size=14px;">' + url +'</h1> \
  <canvas id="result"></canvas> \
  <canvas id="before"></canvas> \
  <canvas id="after"></canvas> \
  </body></html>';

  // Set the config in the web page
  page.evaluate(function(b, a, s, filter) {
      window.burl = "file://"+ b;
      window.aurl = "file://"+ a;
      window.size = [s[0], s[1]];
      window.filter = filter;
    },
    fs.absolute(before_filename),
    fs.absolute(after_filename),
    size,
    options.filter
  );

  if (!page.injectJs('compare.js')) {
    quit("Could not load javascript into page.");
  }

  // Useful for debugging
  page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg);
  };
  page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
  };

  // Wait for the page to load
  page.onLoadFinished = function(status) {
    var grab = function () {
      page.render(output_filename);
      page.close();
      quit();
    };

    // We need to wait to do the screen grab until the page title has been changed to done.
    var id = setInterval(function () {

      // Grab the page title
      var title = page.evaluate(function() {
        return document.title;
      });

      if (title == "done") {
        clearInterval(id);

        // There is a stats object set on the window that gives results of the comparisson
        var stats = page.evaluate(function() {
          return window.stats;
        });

        if (options.hide_before_and_after) {
          page.clipRect = { top: 0, left: 0, width: size[0], height: size[1] };
        }

        // If the difference meets or exceeds the threshold then grab an image
        if (!options.threshold || stats.percentage >= options.threshold) {
          grab();
        } else {
          quit();
        }
      }
    }, 50);
  };
}

/**
 * Make a good filename for our url
 *
 * Uses the directories obejct (before, after, output) to set directory.
 *
 * @param {string} url
 * @param {array} size  Two dimensions. width, height
 * @param {string} prefix  First part of filename
 *
 * @returns {string}
 */
function getFilename(url, size, prefix) {
  var re = /[^A-Za-z0-9\.\-]/g;
  var str = prefix + '-' + url + '-' + size[0] + 'x' + size[1] + '.png';
  var filename = str.replace(re, "-");

  switch(prefix) {
    case 'before':
      filename = directories.before + '/' + filename;
      break;
    case 'after':
      filename = directories.after + '/' + filename;
      break;
    case 'output':
      filename = directories.output + '/' + filename;
      break;
  }

  return filename;
}

/**
 * Capture a page.
 *
 * @param {string} url
 * @param {array} size  Two dimensions. width, height
 * @param {string} prefix  First part of filename
 * @param {function} callback
 */
function capture(url, size, prefix, callback) {
  var page = require('webpage').create();
  page.viewportSize = {
      width: size[0],
      height: size[1]
  };
  page.zoomFactor = 1;

  // Useful for debugging
  page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg);
  };

  var filename = getFilename(url, size, prefix);

  // We can only work with absolute filenames
  var m = url.match(/file:\/\/(.+)/);
  if (null !== m) {
    url = 'file://' + fs.absolute(m[1]);
  }

  page.open(url, function (status) {

    page.evaluate(function() {
      document.body.bgColor = 'white';
    });

    page.render(filename);
    page.close();
    if (callback != undefined) {
      callback();
    }
  });
}
