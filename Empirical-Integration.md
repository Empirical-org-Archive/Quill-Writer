Empirical Core API Notes
------------------------

These notes serve as a guide for interacting with the Empirical-Core API
from a App perspective.

These notes will use [Quill-Writer](https://github.com/empirical-org/Quill-Writer) as an example.

An app must be registered with quill.org as an OAuth Application. There
are two fields that contain URLs that point to different parts of your
app. They are the form url and module url.

###Form URL

The form url is used when you want to add activities into Empirical-Core
for your particular App. First you get a form from Empirical-Core that
asks for Name, Description, Flag, and Topic. Once you fill out this
information, an iframe with it's `src` filled in with the form url you
provided when you created your application.

The form url is for the vendor properties of your application. In the
case of Quill-Writer, the properties we use are for building an
individual story. The properties we use are the prompt for the story, a
list of words/definitions/part of speech, and the number of words
required. These properties may change in the future.

The form url is responsible for `POST`ing your app's vendor properties
described aboved. The properties will be returned to you in the by a
`GET` request in the future by the rest of your App's code whose entry
point is the module url.

In addition to the vendor properties, which will be the data attribute
you post, other parameters are required. They are outlined in the
Empirical Docs [here](http://empirical-core.readme.io/v1.0/docs/activities).
