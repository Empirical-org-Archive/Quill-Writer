Empirical Core API Notes
------------------------

#Please see our [readme.io
page](http://empirical-core.readme.io/v1.0/docs/quill-apps-empirical-core-integration-with-quill-w) for updated documentation

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

If you need to update different aspects of your app's particular
activity, you can make `PATCH` requests with the particular attribute
you need to update. If you are making an update to your vendor
properties, the `data` attribute, you must update the whole object.

For the example of a JavaScript application, you will more than likely
want to serialize your `data` in JSON. This most likely holds true for
other programming languages as well.

####Example Vendor Properties

```
{"wordList":[{"word":"Hello","definition":"Hello is a word"},{"word":"Soda","definition":"Sugary fizzy drink"},{"word":"Ello","definition":"New social network that is free and won't sell your information"},{"word":"Gmail","definition":"Web Email program"},{"word":"Turtle","definition":"An amphibian that has a shell"}],"prompt":"Hey this is an example prompt","requirements":{"needed":"4"}}
```

If you look at the required data, [here](http://empirical-core.readme.io/v1.0/docs/activities) you
won't have the `activity_classification_id` or the `topic_id`. These will need to be passed from
Empirical Core via cookies or perhaps a Query String Parameter on your form URL.

###Module URL

The module URL is where students and other users of your application
will use. The module URL is loaded from Quill by setting an iframe src
to the URL you provide.

We really need to figure out how we want to pass data from
Empirical-Core to apps?

I like the idea passing values around via cookies but I think we might
run into third party cookie issues perhaps?

The other option is append Query String parameters.

Regardless of how we get the information, we would like to assume that
your application can access the activity uid, the activity session uid,
and the current user of the iframe, aka your application.

Once you have the required parameters you can make requests to the
Empirical-Core.

To get details about an activity make a `GET /activites/:uid` where uid
is your activities unique identifier. The UID for now is know to the
Quill-Writer developers. In the future we will be passed this
information.

In the future, we plan to provide a JavaScript Client Library, and an
Angular wrapper that will provide a clean SDK for client applications.


