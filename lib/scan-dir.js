"use strict";

var fs = require('fs');

/**
 * Output directory scanning middleware
 *
 * Options
 *  - head  - Code to inject into <head> tag in page
 *
 * @param {String} directory  The directory containing the output images
 * @param {Object} options    Object with properties enumerated above
 * @api public
 */
module.exports = function (directory, options) {
  var dir = directory;

  console.dir(directory);
  console.dir(options);

  if (options === undefined) {
    options = {};
  }
  return function (req, res, next) {
    if ('/' === req.url) {
      fs.readdir(dir, function (err, files) {
        var imgs = [],
          i,
          match;

        if (err) {
          res.writeHead(500);
          res.end('Could not read directory');
          return;
        }
        res.writeHead(200);
        for (i = 0; i < files.length; i += 1) {
          match = files[i].match(/(output|before|after)\-.+\-([0-9]+)x([0-9]+)\.png$/);
          if (match !== null) {
            imgs.push('<a href="' + match[0] + '"><img style="width: 100px" src="' + match[0] + '"></a>');
          }
        }
        if (options.head === undefined) {
          res.end("<html><body>" + imgs.join('<br>') + "</body></html>");
        } else {
          fs.readFile(options.head, function (err, data) {
            if (err) {
              res.end("<html><body>" + imgs.join('<br>') + "</body></html>");
            } else {
              res.end("<html><head>" + data + "</head><body><ul><li>" + imgs.join('</li><li>') + "</li></ul></body></html>");
            }
          });
        }
      });
    } else {
      next();
    }
  };
};
