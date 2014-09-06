# Stories with Friends

Stories with Friends - Learn vocabulary by writing stories.

View the [work in progress site
here](https://storieswithfriends.firebaseapp.com/#/)

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
* Install development dependencies `npm install`
* Install gulp globally `npm install gulp -g`
* Run `gulp`
* Open a browser window to `http://localhost:4000/`

## Developing

Stories with Friends is an Angular front end application that uses
[firebase](https://www.firebase.com/) for socket communication and game
state persistence between students.

We utilize [Gulp]() for a build tool and development server. [Bower]()
for most front end dependencies. [NPM](http://www.npmjs.org) for
installing development dependencies and versioning.

We write modular front end code with [Browserify](). While we still use
Angular dependency injection, we must "require" in and "export" the
application modules to be walked and injected into the Browserify
bundle.

###Examples of Browserifying the app

####Adding a helper function to src/app/game

* Make a new "module" game-helper.js in `src/app/game/`
```
function gameHelper(game) {
  //do something cool
}

module.exports = gameHelper;
```
* Require in the gameHelper in `src/app/game/index.js`

```
var gameHelper = require('./game-helper');
```
Notice the relative module include

* Use the function as you wish

```
...
var result = gameHelper(game);
...
```




## Contributing

Additional information can be found in the [wiki](https://github.com/empirical-org/Stories-With-Friends/wiki/contributing).

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
