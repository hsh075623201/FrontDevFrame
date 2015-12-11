(function() {
  window.Config = {
    name: "app",
    uri: {
      base: "/",
      host: "/",
      api: "Test/"
    },
    "default": {
      displayCount: 20
    },
    piwik: {
      enabled: false,
      app: 'appName',
      prod: 'prodName',
      url: '',
      siteId: 0
    },
    intro: {
      enabled: true
    },
    urlHtml5Mode: true,
    version: "0.0.1"
  };

}).call(this);

(function() {
  Config.intros = [
    {
      intro: "Hello World!",
      position: 'bottom'
    }, {
      intro: "This is the header",
      position: 'bottom'
    }
  ];

}).call(this);

(function() {
  Config.routes = [
    {
      url: "/",
      params: {
        name: "home",
        label: "Home",
        templateUrl: "partials/home.html",
        controller: "HomeCtrl"
      }
    }, {
      url: "/about",
      params: {
        name: "about",
        label: "About Us",
        templateUrl: "partials/about.html"
      }
    }, {
      url: "/summary",
      params: {
        name: "summary",
        label: "Summary",
        templateUrl: "partials/summary.html",
        controller: "SummaryCtrl"
      }
    }, {
      url: "/allrule",
      params: {
        name: "allRule",
        label: "allRule",
        templateUrl: "partials/allRule.html",
        controller: "AllRuleCtrl"
      }
    }
  ];

}).call(this);
