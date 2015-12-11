Config.routes = [
  {
    url: "/"
    params:
      name: "home"
      label: "Home"
      templateUrl: "partials/home.html"
      controller: "HomeCtrl"
  }
  {
    url: "/about"
    params:
      name: "about"
      label: "About Us"
      templateUrl: "partials/about.html"
  }
  {
    url: "/summary"
    params:
      name: "summary"
      label: "Summary"
      templateUrl: "partials/summary.html"
      controller:"SummaryCtrl"
  }
  {
    url: "/allrule"
    params:
      name: "allRule"
      label: "allRule"
      templateUrl: "partials/allRule.html"
      controller:"AllRuleCtrl"
  }
]
