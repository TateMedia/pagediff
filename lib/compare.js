"use strict";

var state = 0; // To check when things have been done.

// Simple function to return a paler greyscale version of a pixel
function equal_pale_grey(before, after) {
  var value = 0;
  
  value = (before[0] + before[1] + before[2]) / 3; 
  value = 255 - (255 - value) / 3;
  
  return [value, value, value, 255];
}

// Make the green channel the before lightness and the red channel the after lightness
function differ_green_red(before, after) {
  var blue  = 0;
  var green = (before[0] + before[1] + before[2]) / 3;
  var red   = (after[0] + after[1] + after[2]) / 3;
  return [red, green, blue, 255];
}

// Loads a PNG into the supplied canvas element
function loadImageIntoCanvas(url, canvas) {
  var context = canvas.getContext( '2d' );
   
  // load image
  var img = new Image();
  img.onload = function () {
    context.canvas.width = size[0];
    context.canvas.height = size[1];
    context.drawImage( img, 0, 0 );
    state++;
  };
  img.src = url;
}

/* Generates a difference image
  args:
    before_canvas   Canvas element containing the before image
    after_canvas    Canvas element containing the after image
    diff_canvas     Canvas element to put the output image
    equal_filter    Function that takes two params the before and after pixels and returns a pixel.
    differ_filter   Function that takes two params the before and after pixels and returns a pixel.
    
  The filter functions take a pixel which is a four element array of values 0-255, RGBA.
*/
function generateDiff(before_canvas, after_canvas, diff_canvas, equal_filter, differ_filter) {

  var before = before_canvas.getContext('2d').getImageData(0, 0, size[0], size[1]).data;
  var after =  after_canvas.getContext('2d').getImageData(0, 0, size[0], size[1]).data;
  var diff_ctx = diff_canvas.getContext('2d');
  
  var length = Math.max(before.length, after.length);
  var id = diff_ctx.createImageData(size[0],size[1]);
  var pixel;
  
  diff_ctx.canvas.width = size[0];
  diff_ctx.canvas.height = size[1];

  // Loop through the pixels
  for (var i = 0; i < length; i+= 4) {
    if (before[i] == after[i]
        && before[i+1] == after[i+1]
        && before[i+2] == after[i+2]
        && before[i+3] == after[i+3]) {
      pixel = equal_filter(
        [before[i],before[i+1],before[i+2],before[i+3]],
        [after[i],after[i+1],after[i+2],after[i+3]]
      ); 
    } else {
      pixel = differ_filter(
        [before[i],before[i+1],before[i+2],before[i+3]],
        [after[i],after[i+1],after[i+2],after[i+3]]
      ); 
    }
    id.data[i] = pixel[0];
    id.data[i+1] = pixel[1];
    id.data[i+2] = pixel[2];
    id.data[i+3] = pixel[3];
    
    //if (i % Math.floor(length/100) == 0) console.log(Math.floor(i * 100 / length) + '% done');
  }
  diff_ctx.putImageData(id, 0, 0);
}

var equal_filter = equal_pale_grey;
var differ_filter = differ_green_red;

var canvas = document.getElementById('result');
var ctx = canvas.getContext('2d');
ctx.canvas.width = size[0];
ctx.canvas.height = size[1];

var before_canvas = document.getElementById('before');
loadImageIntoCanvas(burl, before_canvas);

var after_canvas = document.getElementById('after');
loadImageIntoCanvas(aurl, after_canvas);

var id = window.setInterval(function() {
  if (state == 2) {
    state++;
    window.clearInterval(id);
    generateDiff(before_canvas, after_canvas, canvas, equal_filter, differ_filter);
    document.title = "done";
  }
}, 500);