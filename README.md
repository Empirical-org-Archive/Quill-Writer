# Stories with Friends

Stories with Friends - Learn vocabulary by writing stories.

## Installation

* Clone this repo to your local machine
* Install dependencies `bower install`
* `cd` to the `src` folder `cd src/`
* Start a server `python -m SimpleHTTPServer`
* Open a browser window to `http://localhost:8000/`

(note: this process should be temporary until a build tool is implemented)

## Best Practices

Most of this skeleton application focuses on scalable best practices.

* Use 'controller as' syntax. Alias controllers: `SomethingCoolCtrl as somethingCool`
* Use `ui-router` for routing/states.
* Organize scripts by features - users, home, lobby, etc.
* Put common components in a `common` or `components` directories - directives, services, etc.
* Create a module for each feature/component, and import dependencies as sub modules.
  * Do not create global modules - `var app = angular.module('app', [])` <-- don't do this
* Prefer `ctrl as...` syntax instead of using `$scope` whenever possible.
* Don't worry about using array syntax for controller dependencies, `ng-min` will take care of that.

## Todo

In addition to the current issues.

* Utilize a build tool (Grunt or Gulp)
* Use template-cache for templates
