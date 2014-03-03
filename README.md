pagediff
========

Creates an image containing the before, after, and difference of a web page
rendering.

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

    pagediff before <url> <options>

This will produce a png file with the name before-<url>-<width>x<height>.png

    pagediff after <url> <options>

This will produce a png file with the name after-<url>-<width>x<height>.png
and a comparisson file with the name output-<url>-<width>x<height>.png

    pagediff <url> <url2> <options>

This will simply compare two URLs.

The url will be sanitized to make it into a half-decent filename.

###Options

    --help                  This help text
    --size=(height)x(width) Size of screen to use in pixels
    --config=(filename)     Load config from file - see Batch mode below

###Output options

    --threshold=nn          Percentage of differing pixels needed before an
                            output image is created. Default 0
    --hide-before-and-after Hide the before and after images in the output. Just
                            show composite
    --before-dir=xxx        Directory to put the before image in.
    --after-dir=xxx         Directory to put the after image in.
    --output-dir=xxx        Directory to put the output image in.
    --output=xxx            Output filename. Override default filename
    --filter=xxx            Filter to use to highlight changes. Two options at
                            the moment "differ_green_red" (default) and
                            "differ_super_red"

###Server options

See server mode below.

    --port=nnnn             Port number. Default 8000
    --head=xxx              Filename of a file containing text to go in the
                            <head> element

Further info:
  https://github.com/TateMedia/pagediff

Batch mode
----------

A file can be used to run the program over several URLs which may be of use in
testing.

    pagediff --config=xxx

Generally a batch file will look like this:

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

Server mode
-----------

    pagediff server --port=8000 --head=head.html

In server mode a web server will run to allow you to see the contents of the
output directory as a crude gallery (you can put some theming in the <head>
tag if need be).

Please please please, do not expose this to the open web, just use it
internally. It hasn't been designed to be safe in any way, just to be
convenient.

To do
-----

1. It probably counts as a bug, but the image heights are fixed when the width
   is set. Need to adjust based on the rendered page height.

2. Add output filename and direct comparison mode to batch system.
