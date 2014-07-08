# Stories with Friends

Stories with Friends - Learn vocabulary by writing stories.

View the [work in progress site here](http://stories-with-friends.herokuapp.com/#/)

Check out the [wiki](https://github.com/empirical-org/Stories-With-Friends/wiki) for more information about the project and how to contribute.

##Compass Activity Specification

The `module_url` for this activity is `/#/`.

For example,

```
http://stories-with-friends.herokuapp.com/#/?uid=asdf1234&sid=5678aoeu
```

will be the complete url Compass loads for Stories with Friends.

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
