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
  var head = undefined;

  if (options === undefined) {
    options = {};
  }
  return function (req, res, next) {
    if ('/' == req.url) {
      fs.readdir(dir, function (err, files) {
        if (err) {
          res.writeHead(500);
          res.end('Could not read directory');
          return;
        }
        res.writeHead(200);
        var images = [];
        var imgs = [];
        for (var i = 0; i < files.length; i++) {
          var match = files[i].match(/(output|before|after)\-.+\-([0-9]+)x([0-9]+)\.png$/);
          if (match !== null) {
            images.push({
              "mode": match[1],
              "width": match[2],
              "height": match[3],
              "filename": match[0]
            });
            imgs.push('<a href="' + match[0] + '"><img style="width: 100px" src="' + match[0] + '"></a>');
          }
        }
        if (options.head === undefined) {
          res.end("<html><body>" + imgs.join('<br>') + "</body></html>");
        } else {
          fs.readFile(options.head,function (err, data) {
            if (err) throw err;
            head = data;
            res.end("<html><head>" + head + "</head><body>" + imgs.join('<br>') + "</body></html>");
          });
        }
      });
    } else {
      next();
    }
  }
}
