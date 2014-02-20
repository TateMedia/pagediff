"use strict";

var fs           = require('fs');
var system       = require('system');
var args         = system.args;

var cmd = args[args.length - 2];
var url = args[args.length - 1];
var size = [1024, 768];

/*
  Call with:
  phantomjs --web-security=false phantom.js before <url>
  
  This will produce a png file with the name before-<url>-<width>x<height>.png
  
  phantomjs --web-security=false phantom.js after <url>

  This will produce a png file with the name after-<url>-<width>x<height>.png
  and a comparisson file with the name output-<url>-<width>x<height>.png
  
  The url will be sanitized to make it into a half-decent filename.
*/

if (url.substring(0,4) != "http") {
  quit("URL must be a full http:// URL");
}

if (cmd == "before") {

  // Capture the before image and quit
  capture(url, size, 'before', function () {
    quit();
  });
} else if (cmd == "after") {
  if (!fs.isFile(getFilename(url, size, 'before'))) {
    quit("No before file");
  }
  
  // Capture the after image
  capture(url, size, 'after', function () {
    // Compare it to the before image for the same url
    compare(
      getFilename(url, size, 'before'),
      getFilename(url, size, 'after'),
      getFilename(url, size, 'output'),
      size
    );
  });
} else {
  // Help text.
  console.log("Call with: \n\
  phantomjs --web-security=false phantom.js before <url> \n\
  \n\
  This will produce a png file with the name before-<url>-<width>x<height>.png \n\
  \n\
  phantomjs --web-security=false phantom.js after <url> \n\
  \n\
  This will produce a png file with the name after-<url>-<width>x<height>.png \n\
  and a comparisson file with the name output-<url>-<width>x<height>.png \n\
  \n\
  The url will be sanitized to make it into a half-decent filename. \n\
  ");
  quit();
}

function quit(msg) {
  if (msg) {
    console.log(msg);
  }
  phantom.exit();
}

function compare(before_filename, after_filename, output_filename, size) {
  var page = require('webpage').create();

  page.viewportSize = { width: size[0], height : size[1] };
  page.content = '<html>\
  <script>var burl = "file://'+ fs.absolute(before_filename) +'"; \
          var aurl = "file://'+ fs.absolute(after_filename) +'"; \
          var size = ['+ size[0] +','+ size[1] +'];\</script>\
  <body> \
  <canvas id="result"></canvas> \
  <canvas id="before"></canvas> \
  <canvas id="after"></canvas> \
  </body></html>';
  
  if (!page.injectJs('compare.js')) {
    quit("Could not load javascript into page.");
  }
  
  // Useful for debugging
  page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg);
  };

  
  // Wait for the page to load
  page.onLoadFinished = function(status) {
    var grab = function () {
      page.render(output_filename);
      page.close();
      quit();
    };
    
    // We need to wait to do the screen grab until the page title has been changed to done.
    var x = 0;
    var id = setInterval(function () {
      
      // Grab the page title
      var title = page.evaluate(function() {
        return document.title;
      });
      
      if (title == "done") {
        clearInterval(id);
        grab();
      }
    }, 50);
  };
}

// Make a good filename for our url
function getFilename(url, size, prefix) {
  var re = /[^A-Za-z0-9\.\-]/g;
  var str = prefix + '-' + url + '-' + size[0] + 'x' + size[1] + '.png';
  var filename = str.replace(re, "-");
  
  return filename;
}

// Capture a page.
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

  page.open(url, function (status) {
    var filename = getFilename(url, size, prefix);

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