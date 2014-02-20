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

Usage
-----

    pagediff before <url>

This will produce a png file with the name before-(url)-(width)x(height).png

    pagediff after <url>

This will produce a png file with the name after-(url)-(width)x(height).png
and a comparisson file with the name output-(url)-(width)x(height).png

The url will be sanitized to make it into a half-decent filename.

To do
-----

1. Allow a config script to be used to provide arguments so that the generation
   of multiple pages can be automated.

2. Allow the size to be set on the command line.

3. It probably counts as a bug, but the image heights are fixed when the width
   is set. Need to adjust based on the rendered page height.

4. Package and send to npm
