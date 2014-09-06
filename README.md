# Stories with Friends

- **Getting Started:** [Start here with this doc.](https://github.com/empirical-org/Documentation/tree/master/Getting-Started) 
- **CLA:** [Please sign our CLA before contributing.] (https://www.clahub.com/agreements/empirical-org/Documentation)
- **Mailing List:** [Empirical Core developers mailing list.](https://groups.google.com/forum/#!forum/empirical-core)
- **Real Time Chat:** [Join us in the Empirical Core Gitter room.](https://gitter.im/empirical-org)

## Stories with Friends - Learn vocabulary by writing stories.

View the [work in progress site
here](https://storieswithfriends.firebaseapp.com/#/)

Check out the [wiki](https://github.com/empirical-org/Stories-With-Friends/wiki) for more information about the project and how to contribute.

##Compass Activity Specification

###Module URL

The `module_url` for this application is `/#/`.

For example,

```
https://storieswithfriends.firebaseapp.com/#/?uid=asdf1234&sid=5678aoeu
```

will be the complete url Compass loads for Stories with Friends.

###Form URL

The `form_url` for this application is `/#/form`

For example,

```
https://storieswithfriends.firebaseapp.com/#/form?uid=1234klasdf
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

We utilize [Gulp](http://gulpjs.com/) for a build tool and development server. [Bower](http://bower.io/)
for most front end dependencies. [NPM](http://www.npmjs.org) for
installing development dependencies and versioning.

We write modular front end code with [Browserify](http://browserify.org/). While we still use
Angular dependency injection, we must "require" in and "export" the
application modules to be walked and injected into the Browserify
bundle.

###Browserifying Conventions to Follow

Most modules will be required in a their directory. For the Profanity
Filter, we require it in like this (from app/game/index.js):

```js
var ProfanityFilter =
require('./../../common/services/profanity-filter/');
```

Note the trailing slash. By default, browserify will search for the
`index.js` file in the `profanity-filter/` directory.

If we were to require a file directly, the trailing slash can be
omitted. For example, requiring constants would look like this (from app/app.js)

```js
var constants = require('./../common/constants')
```

###Examples of Browserifying the app

####Adding a helper function to src/app/game

* Make a new "module" game-helper.js in `src/app/game/`
```js
function gameHelper(game) {
  //do something cool
}

module.exports = gameHelper;
```
* Require in the gameHelper in `src/app/game/index.js`

```js
var gameHelper = require('./game-helper');
```
Notice the relative module include

* Use the function as you wish

```js
...
var result = gameHelper(game);
...
```

####Creating a New Service

We need to create a spell check service for our game view.

* `mdkir src/common/services/spell-check`
* `$EDITOR src/common/services/spell-check/index.js`
* Write your awesome spell check service
* Make sure to export out the angular service name you register with.
```js
module.exports = 'sf.services.spellcheck'
```
* Require in the spell check module, so Browserify knows to bundle it.
```js
var SpellCheck = require('./../../common/services/spell-check/');

angular.module('example-consumer', [
  SpellCheck
])
...
```

Because SpellCheck is equal to 'sf.services.spellcheck', Angular knows
which Service 'example-consumer' needs as a dependency.

To reiterate,

1. `require`ing the module file tells Browserify to include it in the
   source bundle.
2. Passing the string object to 'example-consumer' tells Angular to look
   for the 'sf.services.spellcheck' module.

If you've used browserify and node for that matter, you will already
know you can export any JavaScript out of a module you'd like! But for
this project we are only exporting string module ids.

As an added bonus all modules are wrapped in a function closure, so feel
free to add "private" functions if desired as they will not pollute the
global name space.


## Contributing

Additional information can be found in the [wiki](https://github.com/empirical-org/Stories-With-Friends/wiki/contributing).

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
