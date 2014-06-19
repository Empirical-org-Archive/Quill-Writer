# Angular Skeleton

Simple template to use when creating an angular app. Utilizes best practices and naming conventions for an application that plans on being large in scale.

## How to run

* Clone this repo to your local machine
* Run `bower install`
* `cd` to the `src` folder `cd src/`
* Start a server `python -m SimpleHTTPServer`
* Open a browser window to `http://localhost:8000/`

## Best Practices

Most of this skeleton application focuses on scalable best practices.

* Use 'controller as' syntax. Alias controllers: `SomethingCoolCtrl as somethingCool`
* Use `ui-router` for routing/states.
* Organize scripts by features - users, home, login, etc.
* Put common components in a common/components area - directives, services.
* Create a module for each feature/component, and import sub modules.
  * Do not create global modules - `var app = angular.module('app', [])` <-- don't do this
* `$scope` can be difficult to manage if heavily nested, use 'ctrl as' syntax instead whenever possible and attach properties to the controller.

## Todo

Regarding creating a strong structure for the app

* Utilize a build tool (Grunt or Gulp)
* Use template-cache for templates
