Ui-component is a set of native directives that enables seamless integration of [Bootstrap 3.0+](https://github.com/twbs/bootstrap) into your [AngularJS 1.2+](https://github.com/angular/angular.js) app.

- The required dependency is [Bootstrap CSS Styles](https://github.com/twbs/bootstrap/blob/master/dist/css/bootstrap.css) and [Font-awesome icon library](https://github.com/FortAwesome/Font-Awesome/blob/master/css/font-awesome.css)


## Documentation and examples

+ Check the [documentation](https://github.corp.ebay.com/opsins/ui-component) and [changelog](https://github.corp.ebay.com/opsins/ui-component/releases).

+ See [demo](https://github.corp.ebay.com/pages/opsins/ui-component/)

## Quick start

+ Bower install:

>
```
bower install git@github.corp.ebay.com:opsins/ui-component.git --save
```
If you want to always use the newest version of ui-component, please update your `bower.json`, make the version number to `*`
```
"ui-component": "git@github.corp.ebay.com:opsins/ui-component.git#*"
```

+ Include the required libraries:

>
``` html
<!-- Bootstrap && font-awesome here -->
<link href="ui-component.min.css" rel="stylesheet" />
<!-- Angularjs here -->
<script src="ui-component.min.js"></script>
<script src="ui-component.tpl.min.js"></script>
```

+ Inject the `ui-component` module into your app:

>
``` JavaScript
angular.module('myApp', ['ui-component']);
```

+ Use the directive

>
``` html
<div ui-side-menu source-url="'https://doe.corp.ebay.com/api/uicomponent/getsidemenu'">
  <!-- your code here -->
</div>
```

## Developers

>
$ npm install --dev
$ gulp test

You can build the latest version using `gulp`.

>
$ gulp build

You can quickly hack around (the docs) with:

>
$ gulp serve



## Contributing

Please submit all pull requests the against master branch. If your unit test contains JavaScript patches or features, you should include relevant unit tests. Thanks!
