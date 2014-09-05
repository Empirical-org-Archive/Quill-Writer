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

## Contributing

Additional information can be found in the [wiki](https://github.com/empirical-org/Stories-With-Friends/wiki/contributing).

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
