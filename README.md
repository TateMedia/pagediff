pagediff
========

Creates an image containing the before, after, and difference of a web page rendering.

Overview
--------

When you're doing a release of a site or making a change in development it 
would be good to know that you've not broken a page or made an unintended 
modification to the styling.

This program allows you to take a snapshot of a site before the change and
another after the change and then create a composite image that shows where
the changes have happened.

Installation
------------

    npm install pagediff

Simple usage
------------

    pagediff <options> before <url> <output-options>
      
This will produce a png file with the name before-<url>-<width>x<height>.png
          
    pagediff <options> after <url> <output-options>
    
This will produce a png file with the name after-<url>-<width>x<height>.png
and a comparisson file with the name output-<url>-<width>x<height>.png
                  
The url will be sanitized to make it into a half-decent filename.

###Options

    --help                  This help text
    --size=(height)x(width) Size of screen to use in pixels
    --config=(filename)     Load config from file - see Batch mode below

###Output options

    --threshold=nn          Percentage of differing pixels needed before an output image is created. Default 0
    --hide-before-and-after Hide the before and after images in the output. Just show composite
    --before-dir=xxx        Directory to put the before image in.
    --after-dir=xxx         Directory to put the after image in.
    --output-dir=xxx        Directory to put the output image in.

Further info:
  https://github.com/TateMedia/pagediff

Batch mode
----------

A file can be used to run the program over several URLs which may be of use in testing.

    {
      'batches' : [
        {
          'mode' : 'before',
          'url' : 'http://...'
        },
        {
          'mode' : 'before',
          'url' : 'https://...',
        },
        {
          'mode' : 'before',
          'url' : 'file://...',
        },
        {
          'mode' : 'before',
          'url' : 'http://...',
          'size' : [640, 480],
          'threshold' : 10,
          'hide_before_and_after': true,
        },
      ],
    }

To do
-----

1. It probably counts as a bug, but the image heights are fixed when the width
   is set. Need to adjust based on the rendered page height.

2. Check that output options make it through from the batch file correctly.

3. Check that directories and thresholds etc can be set at the top of the file as
   defaults that the rest of the file can override.
