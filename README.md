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

    pagediff before <url>

This will produce a png file with the name before-(url)-(width)x(height).png

    pagediff after <url>

This will produce a png file with the name after-(url)-(width)x(height).png
and a comparisson file with the name output-(url)-(width)x(height).png

The url will be sanitized to make it into a half-decent filename.

Options
-------

### Main options

    pagediff before|after http://... (width)x(height) (output options)

### Output options

    --threshold=nn           Only output an output image if there are nn% pixels
                             difference or more. In a batch this is:
                              'threshold': 10,

    --hide-before-and-after  Only show the composite image in the output file, not
                             the before and after images. In a batch this is:
                              'hide_before_and_after': true,


Batch mode
----------

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

1. Allow a config script to be used to provide arguments so that the generation
   of multiple pages can be automated.

2. Allow the size to be set on the command line.

3. It probably counts as a bug, but the image heights are fixed when the width
   is set. Need to adjust based on the rendered page height.

