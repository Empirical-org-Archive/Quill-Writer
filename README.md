# Stories with Friends

# Welcome to Stories with Friends!

- **Getting Started:** [Start here with this doc.](https://github.com/empirical-org/Documentation/tree/master/Getting-Started) 
- **Mailing List:** [Empirical Core developers mailing list.](https://groups.google.com/forum/#!forum/empirical-core)
- **Real Time Chat:** [Join us in the Empirical Core Gitter room.](https://gitter.im/empirical-org)

## Stories with Friends - Learn vocabulary by writing stories.

View the [work in progress site here](http://stories-with-friends.herokuapp.com/#/)

Check out the [wiki](https://github.com/empirical-org/Stories-With-Friends/wiki) for more information about the project and how to contribute.

##Compass Activity Specification

###Module URL

The `module_url` for this application is `/#/`.

For example,

```
http://stories-with-friends.herokuapp.com/#/?uid=asdf1234&sid=5678aoeu
```

will be the complete url Compass loads for Stories with Friends.

###Form URL

The `form_url` for this application is `/#/form`

For example,

```
http://stories-with-friends.herokuapp.com/#/form?uid=1234klasdf
```

The form url is served up when an administrator wants to add another
activity. Compass provides a small form to input the name, description,
flag and topic. Stories with Friends must provide a form for vendor
data.

A Stories with Friends Activity will need the prompt, list of word +
definition pairs, and the number of words used to finish the story.

## Installation

* Clone this repo to your local machine
* Install frontend dependencies `bower install`
* Install backend dependencies `npm install`
* run `npm start` or [nodemon](https://github.com/remy/nodemon) bin/www
* Open a browser window to `http://localhost:3000/` or set port with PORT env var

## Todo

In addition to the current issues.

* Utilize a build tool (Grunt or Gulp)
* Use template-cache for templates
* Find a way to run post install commands on FireBase hosting (stop committing vendor scripts).

## Contributing

Additional information can be found in the [wiki](https://github.com/empirical-org/Stories-With-Friends/wiki/contributing).

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
