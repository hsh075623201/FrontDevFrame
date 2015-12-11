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

(function() {
  angular.module("config", []).config(function($routeProvider, $locationProvider, $logProvider) {
    var isHtml5Mode;
    if (angular.isUndefined(Config.debug) || Config.debug !== false) {
      Config.debug = true;
    }
    if (angular.isUndefined(Config.development) || Config.development !== false) {
      Config.development = true;
    }
    if (Config.debug === false) {
      $logProvider.debugEnabled(false);
    }
    angular.forEach(Config.routes, function(route) {
      if (route.params && !route.params.controller) {
        route.params.controller = 'BaseCtrl';
      }
      $routeProvider.when(route.url, route.params);
    });
    $routeProvider.otherwise({
      templateUrl: 'partials/404.html'
    });
    isHtml5Mode = !!Config.urlHtml5Mode && Modernizr.history;
    $locationProvider.html5Mode(isHtml5Mode);
    $locationProvider.hashPrefix('!');
  });

  window.onload = function() {
    var registerController;
    if (angular.isUndefined(Config.name)) {
      console.error("Config.name is undefined, please update config.json to include this property.");
    }
    registerController = (function() {
      var ctrlSet;
      ctrlSet = {};
      return function(ctrl) {
        var name;
        if (!ctrlSet[ctrl]) {
          name = ctrl.substring(0, ctrl.indexOf('Ctrl'));
          angular.module(Config.name).controller(ctrl, [
            '$scope', "" + name + "ViewModel", function(scope, ViewModel) {
              return scope.vm = new ViewModel(scope);
            }
          ]);
          return ctrlSet[ctrl] = 1;
        }
      };
    })();
    angular.forEach(Config.routes, function(route) {
      var ctrl;
      ctrl = route.params.controller;
      if (ctrl == null) {
        ctrl = 'BaseCtrl';
      }
      return registerController(ctrl);
    });
    return angular.bootstrap(document, [Config.name]);
  };

}).call(this);

(function() {
  'use strict';
  angular.module('m-util', []).factory('Util', function($modal, $timeout, $location, $anchorScroll, $window, $http, $templateCache, $compile, $q, $route, Cache) {
    var Util;
    Util = (function() {
      var alertTpl;

      function Util() {}

      alertTpl = 'partials/modal/alert.html';

      Util.prototype.createDialog = function(template, scope, thenFunc, options) {
        var closed, dialog;
        if (options == null) {
          options = {};
        }
        closed = false;
        options = angular.extend({
          backdropFade: true,
          templateUrl: template,
          controller: [
            "$scope", "$modalInstance", "scope", function($scope, $modalInstance, scope) {
              $scope = angular.extend($scope, scope);
              return $scope.close = function(data) {
                if (!closed) {
                  $modalInstance.close(data);
                  return closed = true;
                }
              };
            }
          ],
          resolve: {
            scope: function() {
              return scope;
            }
          }
        }, options);
        dialog = $modal.open(options);
        dialog.result.then(thenFunc);
        return dialog;
      };

      Util.prototype.alert = function(message, type, thenFunc) {
        var mclass, scope;
        mclass = (function() {
          switch (type) {
            case 'success':
              return 'alert-success';
            case 'fail':
              return 'alert-danger';
            case 'confirm':
              return 'alert-warning';
          }
        })();
        scope = {
          message: message,
          type: type,
          "class": mclass
        };
        return this.createDialog(alertTpl, scope, thenFunc);
      };

      Util.prototype.success = function(message, thenFunc) {
        return this.alert(message, 'success', thenFunc);
      };

      Util.prototype.fail = function(message, thenFunc) {
        return this.alert(message, 'fail', thenFunc);
      };

      Util.prototype.confirm = function(message, thenFunc) {
        return this.alert(message, 'confirm', thenFunc);
      };

      Util.prototype.compileTemplate = function(templateUrl, scope) {
        var defer, loader;
        defer = $q.defer();
        loader = $http.get(templateUrl, {
          cache: $templateCache
        });
        loader.success(function(html) {
          return defer.resolve($compile(html)(scope));
        });
        return defer.promise;
      };

      Util.prototype.toggleFullscreen = function(e) {
        angular.element(document.body).toggleClass('fullscreenStatic');
        return angular.element(e).toggleClass('fullscreen');
      };

      Util.prototype.daysBetween = function(date1, date2) {
        var date1_ms, date2_ms, difference_ms, one_day;
        one_day = 1000 * 60 * 60 * 24;
        date1_ms = date1.getTime();
        date2_ms = date2.getTime();
        difference_ms = Math.abs(date2_ms - date1_ms);
        return Math.round(difference_ms / one_day);
      };

      Util.prototype.formatDate = function(date) {
        if (date === '0000-00-00 00:00:00') {
          return '';
        } else {
          return date;
        }
      };

      Util.prototype.truncDate = function(date) {
        if (!date || date === '0000-00-00') {
          return '';
        } else {
          return date.match(/\S+/g)[0];
        }
      };

      Util.prototype.truncateCharacter = function(input, chars, breakOnWord) {
        var lastspace;
        if (isNaN(chars)) {
          return input;
        }
        if (chars <= 0) {
          return '';
        }
        if (input && input.length >= chars) {
          input = input.substring(0, chars);
          if (!breakOnWord) {
            lastspace = input.lastIndexOf(' ');
            if (lastspace !== -1) {
              input = input.substr(0, lastspace);
            }
          } else {
            while (input.charAt(input.length - 1) === ' ') {
              input = input.substr(0, input.length(-1));
            }
          }
          return input + '...';
        }
        return input;
      };

      Util.prototype.redirect = function(path, force) {
        path = path.replace('%', '');
        if ($location.url() !== path) {
          return $location.url(path);
        } else {
          if (force) {
            return $route.reload();
          }
        }
      };

      Util.prototype.reload = function() {
        return $route.reload();
      };

      Util.prototype.scrollTo = function(height) {
        return $window.scrollTo(0, height);
      };

      Util.prototype.setUpScrollHandler = function(elId, event) {
        return $timeout(function() {
          var el;
          el = document.getElementById(elId);
          if (el) {
            $anchorScroll();
            return angular.element(el).triggerHandler(event);
          }
        }, 0);
      };

      Util.prototype.getParams = function() {
        return $location.search();
      };

      Util.prototype.getUserParam = function(user) {
        return {
          nt: user.nt,
          fullname: user.displayName,
          label: user.label
        };
      };

      Util.prototype.getWithCache = function(key, isSession, getFunc, timeout) {
        var cache, data, defer, promise;
        cache = Cache;
        if (isSession) {
          cache = Cache.session;
        }
        defer = $q.defer();
        data = cache.get(key);
        if (data) {
          defer.resolve(data);
          return defer.promise;
        } else {
          promise = getFunc();
          promise.then(function(data) {
            var e;
            try {
              return cache.set(key, data, timeout);
            } catch (_error) {
              e = _error;
              return console.log(e);
            }
          });
          return promise;
        }
      };

      Util.prototype.capitalize = function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      Util.prototype.solrEscape = function(q) {
        return q.replace(/[+\-\!\(\)\{\}\[\]\^"~\*\?:\\]+/g, ' ');
      };

      Util.prototype.removeHtmlTags = function(str) {
        return str.replace(/<[^>]*>?/g, '');
      };

      Util.prototype.waitUntil = function(func, check, interval, maxTime) {
        var doWait;
        if (interval == null) {
          interval = 300;
        }
        if (maxTime == null) {
          maxTime = 100;
        }
        doWait = function(time) {
          var defer, ret;
          defer = $q.defer();
          if (time <= 0) {
            defer.reject("exceed " + maxTime + " times check");
          } else {
            ret = func();
            if (check(ret)) {
              defer.resolve(ret);
            } else {
              $timeout((function(_this) {
                return function() {
                  return doWait(time - 1).then(function(ret) {
                    return defer.resolve(ret);
                  }, function(err) {
                    return defer.reject(err);
                  });
                };
              })(this), interval);
            }
          }
          return defer.promise;
        };
        return doWait(maxTime);
      };

      Util.prototype.recurUntil = function(func, check, args, nextArgsFunc, maxTime) {
        var doRecur;
        if (maxTime == null) {
          maxTime = 100;
        }
        doRecur = function(time, lastRet) {
          var defer, ret;
          defer = $q.defer();
          if (time <= 0) {
            defer.reject("exceed " + maxTime + " times check");
          } else {
            if (time === maxTime) {
              ret = func.apply(this, args);
            } else {
              ret = func.apply(this, nextArgsFunc(lastRet));
            }
            if (check(ret)) {
              defer.resolve(ret);
            } else {
              doRecur(time - 1, ret).then(function(ret) {
                return defer.resolve(ret);
              }, function(err) {
                return defer.reject(err);
              });
            }
          }
          return defer.promise;
        };
        return doRecur(maxTime);
      };

      Util.prototype.deepExtend = function() {
        var args, target;
        if (arguments.length < 1 || typeof arguments[0] !== "object") {
          return false;
        }
        if (arguments.length < 2) {
          return arguments[0];
        }
        target = arguments[0];
        args = Array.prototype.slice.call(arguments, 1);
        args.forEach((function(_this) {
          return function(obj) {
            var clone, key, src, val, _results;
            if (typeof obj !== "object") {
              return;
            }
            _results = [];
            for (key in obj) {
              if (!(key in obj)) {
                continue;
              }
              src = target[key];
              val = obj[key];
              if (val === target) {
                continue;
              }
              if (typeof val !== "object" || val === null) {
                target[key] = val;
                continue;
              } else if (val instanceof Date) {
                target[key] = new Date(val.getTime());
                continue;
              } else if (val instanceof RegExp) {
                target[key] = new RegExp(val);
                continue;
              }
              if (typeof src !== "object" || src === null) {
                clone = (Array.isArray(val) ? [] : {});
                target[key] = _this.deepExtend(clone, val);
                continue;
              }
              if (Array.isArray(val)) {
                clone = (Array.isArray(src) ? src : []);
              } else {
                clone = (!Array.isArray(src) ? src : {});
              }
              _results.push(target[key] = _this.deepExtend(clone, val));
            }
            return _results;
          };
        })(this));
        return target;
      };


      /*
        process exclusive click event and dblclick event
       */

      Util.prototype.clicker = function(clickFunc, dblclickFunc, delay) {
        var clicks, timer;
        if (delay == null) {
          delay = 500;
        }
        clicks = 0;
        timer = null;
        return function() {
          var args;
          args = arguments;
          clicks += 1;
          if (clicks === 1) {
            return timer = setTimeout((function(_this) {
              return function() {
                clicks = 0;
                if (_.isFunction(clickFunc)) {
                  return clickFunc.apply(_this, args);
                }
              };
            })(this), delay);
          } else {
            clicks = 0;
            clearTimeout(timer);
            if (_.isFunction(dblclickFunc)) {
              return dblclickFunc.apply(this, args);
            }
          }
        };
      };

      return Util;

    })();
    return new Util();
  });

}).call(this);

(function() {
  angular.module('m-directive', ['m-util']);

}).call(this);

(function() {
  'use strict';
  window.App = angular.module(Config.name, ['ngSanitize', 'ngRoute', 'ngAnimate', 'restangular', 'ui.bootstrap', 'headroom', 'config', 'm-directive', 'm-service', 'ui-component']);

  angular.module('m-service', ['m-util']);

  angular.module('m-directive', ['m-util']);

  App.constant('Config', Config);

  App.constant('Cache', locache);

  App.constant('_', _);

  App.config(function($provide, $httpProvider, RestangularProvider) {
    RestangularProvider.setBaseUrl(Config.uri.api);
    return $httpProvider.interceptors.push(function($timeout, $q, $rootScope, $location) {
      return {
        request: function(config) {
          return config || $q.when(config);
        },
        responseError: function(response) {
          var tplErrorHandler;
          if (response.data && response.data.message) {
            tplErrorHandler = 'partials/modal/error_handler.html';
            $rootScope.Util.createDialog(tplErrorHandler, {
              message: response.data.message
            }, function() {});
          }
          return $q.reject(response);
        }
      };
    });
  });

  App.run(function(AppInitService) {
    return AppInitService.init();
  });

}).call(this);

(function() {
  App.constant('Constant', {
    dict: {}
  });

}).call(this);


/**
 @ngdoc directive
 @name m-directive.directive:mBreadcrumb
 @element div
 @restrict AE
 @description This directive is used to create breadcrumbs
 @example
    <example module="eg">
    <file name="index.js">
      angular.module('eg',['m-directive'])
        .controller('EgCtrl', function($scope, breadcrumbs){
          $scope.breadcrumbs = breadcrumbs;
        });
    </file>
    <file name="index.html">
      <div ng-controller="EgCtrl">
        <m-breadcrumb></m-breadcrumb>
      </div>
    </file>
    </example>
 */

(function() {
  angular.module('m-directive').directive('mBreadcrumb', function() {
    return {
      restrict: 'AE',
      scope: {},
      controller: function($scope, breadcrumbs) {
        return $scope.breadcrumbs = breadcrumbs;
      },
      template: "<ol class=\"ab-nav breadcrumb\">\n  <li ng-repeat=\"breadcrumb in breadcrumbs.get() track by breadcrumb.path\"\n    ng-class=\"{ active: $last }\">\n    <a ng-if=\"!$last\" ng-href=\"{{ breadcrumb.path }}\"\n      ng-bind=\"breadcrumb.label\" class=\"margin-right-xs\"></a>\n    <span ng-if=\"$last\" ng-bind=\"breadcrumb.label\"></span>\n  </li>\n</ol>"
    };
  });

}).call(this);

(function() {
  angular.module('m-directive').directive('mCompile', function($compile) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        return scope.$watch(function() {
          return scope.$eval(attrs.mCompile);
        }, function(value) {
          element.html(value);
          return $compile(element.contents())(scope);
        });
      }
    };
  });

}).call(this);

(function() {
  angular.module('m-directive').directive('mDynamicTpl', function(Util, $rootScope) {
    var linker;
    linker = function(scope, element, attrs) {
      scope.Util = Util;
      scope.dict = $rootScope.dict;
      return Util.compileTemplate(scope.tpl, scope).then(function(html) {
        return element.replaceWith(html);
      });
    };
    return {
      restrict: 'E',
      scope: {
        tpl: '=',
        data: '=',
        actions: '='
      },
      link: linker
    };
  });

}).call(this);


/**
  @ngdoc directive
  @name m-directive.directive:mFullscreen
  @element div
  @restrict A
  @description This directive is used to toggle fullscreen on an element
  @example
    <example module="eg">
    <file name="index.js">
      angular.module('eg',['m-directive'])
        .controller('EgCtrl', ['$scope', function($scope){
        }]);
    </file>
    <file name="index.html">
      <div ng-controller="EgCtrl">
        <div m-fullscreen style="border: solid 1px">
          <button class="btn btn-primary"
            type="button" data-toggle="m-fullscreen"></button>
        </div>
      </div>
    </file>
    </example>
 */

(function() {
  angular.module('m-directive').directive('mFullscreen', function() {
    var findChild;
    findChild = function(el, func) {
      var child, children, e, find, _i, _len;
      el = angular.element(el);
      children = el.children();
      e = _.find(children, function(d) {
        return func(d);
      });
      if (e) {
        return e;
      } else {
        for (_i = 0, _len = children.length; _i < _len; _i++) {
          child = children[_i];
          find = findChild(child, func);
          if (find) {
            return find;
          }
        }
      }
    };
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var toggleEl;
        toggleEl = findChild(element, function(d) {
          return 'm-fullscreen' === angular.element(d).attr('data-toggle');
        });
        if (toggleEl) {
          toggleEl = angular.element(toggleEl);
          toggleEl.attr('style', 'cursor:sw-resize');
          toggleEl.bind('click', function() {
            angular.element(document.body).toggleClass('fullscreenStatic');
            return element.toggleClass('fullscreen');
          });
          return scope.$on('$destroy', function() {
            return toggleEl.unbind('click');
          });
        }
      }
    };
  });

}).call(this);

(function() {
  angular.module('m-directive').directive('mLoading', function() {
    return {
      restrict: 'E',
      scope: {},
      template: "<div class=\"loading\">\n<i class=\"fa fa-spinner fa-spin pull-left\">\n</i>\n<h4>{{ text }}</h4>\n</div>",
      link: function(scope, element, attrs) {
        scope.text = attrs.text;
        return scope.text != null ? scope.text : scope.text = 'Loading...';
      }
    };
  });

}).call(this);


/**
 @ngdoc directive
 @name m-directive.directive:mAnnoucement
 @element div
 @restrict AE
 @description This directive is used to create `annoucements`,
 @example
  <example module="eg">
    <file name="index.js">
      angular.module('eg',['ui.bootstrap', 'm-directive'])
        .controller('EgCtrl', ['$scope', function($scope){
          $scope.anns = [{
            date: "2014-01-01",
            msg: "this is a test"
          }];
        }]);
    </file>
    <file name="index.html">
      <div ng-controller="EgCtrl">
        <m-announcement announcements="anns"></m-announcement>
      </div>
    </file>
  </example>
 */

(function() {
  angular.module('m-directive').directive('mAnnouncement', function($position) {
    return {
      restrict: 'AE',
      scope: {
        announcements: '='
      },
      template: "<span ng-show=\"show\">\n<i class=\"fa fa-bullhorn animated infinite\"\n   ng-class=\"{flash:flash}\"></i>\n<div class=\"popover right fade in\"\n  style=\"transform:translateY(-40%);word-break:break-word;\">\n  <div class=\"arrow\" style=\"top:90%\"></div>\n  <div class=\"popover-inner\">\n  <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n  <div class=\"popover-content\">\n    <alert ng-repeat=\"a in announcements\"\n      type=\"{{a.type || 'success'}}\"\n      style=\"margin:3px;padding:2px\">\n      <p>\n        <div class=\"label label-primary\"\n          style=\"margin-right:5px\">\n          {{a.date | date:'yyyy-MM-dd HH:mm:ss'}}\n        </div>\n        <div style=\"margin-left:5px\">{{a.msg}}</div>\n      </p>\n    </alert>\n  </div>\n  </div>\n</div>\n</span>",
      controller: function($scope) {
        var cacheKey;
        cacheKey = 'viewed_annoucement_date';
        $scope.$watch('announcements', function(newVal, oldVal) {
          var first;
          if (newVal && newVal.length) {
            $scope.show = true;
            first = newVal[0];
            if (new Date(first.date) > new Date(localStorage.getItem(cacheKey))) {
              $scope.flash = true;
            }
            return localStorage.setItem(cacheKey, first.date);
          }
        }, true);
        return $scope.stopFlash = function() {
          return $scope.flash = false;
        };
      },
      link: function(scope, element, attrs) {
        var icon, list;
        icon = element.find('i');
        list = element.find('div');
        if (list.length) {
          list = angular.element(list[0]);
        }
        scope.title = attrs.title || 'Announcements';
        element.bind('mouseenter', function() {
          var ttPosition;
          scope.$apply(scope.stopFlash);
          list.css('display', 'block');
          ttPosition = $position.positionElements(icon, list, attrs.placement || 'right');
          ttPosition.top += 'px';
          ttPosition.left += 'px';
          return list.css(ttPosition);
        });
        element.bind('mouseleave', function() {
          return list.css('display', 'none');
        });
        return scope.$on('$destroy', function() {
          element.unbind('mouseenter');
          return element.unbind('mouseleave');
        });
      }
    };
  });

}).call(this);

(function() {
  angular.module('m-directive').directive('mPagination', function($parse, $q) {
    return {
      restrict: 'EA',
      scope: {
        conf: '=conf'
      },
      replace: true,
      templateUrl: 'partials/directive/pagination.html',
      link: function(scope, element, attrs) {

        /*scope.conf = 
          currentPage: 1
          totalItems: 423
          itemsPerPage: 10
          pagesLength: 9
          perPageOptions: [10, 20, 30, 40, 50]
         */
        var getPagination, watchExp;
        scope.changeCurrentPage = function(item) {
          if (item === '...') {

          } else {
            return scope.conf.currentPage = item;
          }
        };
        scope.conf.pagesLength = parseInt(scope.conf.pagesLength) ? parseInt(scope.conf.pagesLength) : 9;
        if (scope.conf.pagesLength % 2 === 0) {
          scope.conf.pagesLength = scope.conf.pagesLength - 1;
        }
        if (!scope.conf.perPageOptions) {
          scope.conf.perPageOptions = [10, 20, 30, 50];
        }
        getPagination = function(newValue, oldValue) {
          var i, offset, _i, _j, _k, _l, _m, _ref, _ref1, _ref2, _ref3, _ref4;
          scope.conf.currentPage = parseInt(scope.conf.currentPage) ? parseInt(scope.conf.currentPage) : 1;
          scope.conf.totalItems = parseInt(scope.conf.totalItems) ? parseInt(scope.conf.totalItems) : 0;
          scope.conf.itemsPerPage = parseInt(scope.conf.itemsPerPage) ? parseInt(scope.conf.itemsPerPage) : scope.conf.perPageOptions[0];
          scope.conf.numberOfPages = Math.ceil(scope.conf.totalItems / scope.conf.itemsPerPage);
          if (scope.conf.currentPage < 1) {
            scope.conf.currentPage = 1;
          }
          if (scope.conf.numberOfPages > 0 && scope.conf.currentPage > scope.conf.numberOfPages) {
            scope.conf.currentPage = scope.conf.numberOfPages;
          }
          scope.jumpPageNum = scope.conf.currentPage;
          scope.pageList = [];
          if (scope.conf.numberOfPages <= scope.conf.pagesLength) {
            for (i = _i = 1, _ref = scope.conf.numberOfPages; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
              scope.pageList.push(i);
            }
          } else {
            offset = (scope.conf.pagesLength - 1) / 2;
            if (scope.conf.currentPage <= offset) {
              for (i = _j = 1, _ref1 = offset + 1; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 1 <= _ref1 ? ++_j : --_j) {
                scope.pageList.push(i);
              }
              scope.pageList.push('...');
              scope.pageList.push(scope.conf.numberOfPages);
            } else if (scope.conf.currentPage > scope.conf.numberOfPages - offset) {
              scope.pageList.push(1);
              scope.pageList.push('...');
              for (i = _k = _ref2 = offset + 1; _ref2 <= 1 ? _k <= 1 : _k >= 1; i = _ref2 <= 1 ? ++_k : --_k) {
                scope.pageList.push(scope.conf.numberOfPages - i);
              }
              scope.pageList.push(scope.conf.numberOfPages);
            } else {
              scope.pageList.push(1);
              scope.pageList.push('...');
              for (i = _l = _ref3 = Math.ceil(offset / 2); _ref3 <= 1 ? _l <= 1 : _l >= 1; i = _ref3 <= 1 ? ++_l : --_l) {
                scope.pageList.push(scope.conf.currentPage - i);
              }
              scope.pageList.push(scope.conf.currentPage);
              for (i = _m = 1, _ref4 = offset / 2; 1 <= _ref4 ? _m <= _ref4 : _m >= _ref4; i = 1 <= _ref4 ? ++_m : --_m) {
                scope.pageList.push(scope.conf.currentPage + i);
              }
              scope.pageList.push('...');
              scope.pageList.push(scope.conf.numberOfPages);
            }
          }
          if (scope.conf.onChange) {
            if (!(oldValue !== newValue && oldValue[0] === 0)) {
              scope.conf.onChange();
            }
          }
          return scope.$parent.conf = scope.conf;
        };
        scope.prevPage = function() {
          if (scope.conf.currentPage > 1) {
            return scope.conf.currentPage -= 1;
          }
        };
        scope.nextPage = function() {
          if (scope.conf.currentPage < scope.conf.numberOfPages) {
            return scope.conf.currentPage += 1;
          }
        };
        scope.jumpToPage = function() {
          scope.jumpPageNum = scope.jumpPageNum.replace(/[^0-9]/g, '');
          if (scope.jumpPageNum !== '') {
            return scope.conf.currentPage = scope.jumpPageNum;
          }
        };
        watchExp = function() {
          var newValue;
          if (!scope.conf.totalItems) {
            scope.conf.totalItems = 0;
          }
          return newValue = scope.conf.totalItems + ' ' + scope.conf.currentPage + ' ' + scope.conf.itemsPerPage;
        };
        return scope.$watch(watchExp, getPagination);
      }
    };
  });

}).call(this);

(function() {
  angular.module('m-directive').directive('mMoreButton', function($parse, $q) {
    return {
      restrict: 'E',
      scope: {
        currentCount: '=currentCount',
        loadFunc: '=loadFunc',
        allCount: '=allCount'
      },
      transclude: true,
      templateUrl: 'partials/directive/moreButton.html',
      link: function(scope, element, attrs) {
        scope.has_more = function() {
          return scope.currentCount < scope.allCount;
        };
        scope.loaded = true;
        return scope.show_more = function() {
          scope.loaded = false;
          return scope.loadFunc(scope.currentCount).then(function() {
            return scope.loaded = true;
          });
        };
      }
    };
  });

}).call(this);

(function() {
  angular.module('m-directive').directive('mNoResult', function() {
    return {
      restrict: 'E',
      scope: {},
      template: "<div class=\"no-result\">\n  {{ text }}\n</div>",
      link: function(scope, element, attrs) {
        scope.text = attrs.text;
        return scope.text != null ? scope.text : scope.text = 'No Result.';
      }
    };
  });

}).call(this);

(function() {
  angular.module('m-directive').directive('mResize', function($window) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var h, height, isFixed, min, r, rate, w;
        w = $window;
        h = w.innerHeight;
        rate = attrs.mResize;
        isFixed = attrs.mResizeFixed;
        min = attrs.mResizeMin || 0;
        if (!rate) {
          rate = 100;
        }
        r = rate / 100;
        height = Math.max(h * r, min) + 'px';
        if (isFixed === 'true') {
          element.css('height', height);
          element.css('overflow-y', 'auto');
          return element.css('overflow-x', 'auto');
        } else {
          return element.css('min-height', height);
        }
      }
    };
  });

}).call(this);

(function() {
  angular.module('m-directive').directive('mScroll', function() {
    return {
      restrict: 'A',
      link: function(scope, el, attrs) {
        var raw, scrollBottomFunc, scrollFunc;
        scrollFunc = attrs.scroll;
        scrollBottomFunc = attrs.scrollBottom;
        raw = el[0];
        if (scrollFunc || scrollBottomFunc) {
          el.bind('scroll', _.debounce(function() {
            if (scrollFunc) {
              scope.$apply(scrollFunc);
            }
            if (scrollBottomFunc) {
              if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
                return scope.$apply(scrollBottomFunc);
              }
            }
          }, 200));
          return scope.$on('destroy', function() {
            return el.unbind('scroll');
          });
        }
      }
    };
  });

}).call(this);

(function() {
  App.factory("animateCSSBuild", [
    "$timeout", function($timeout) {
      var defaultDelay;
      defaultDelay = 500;
      return function(baseClass, classNames) {
        var a, animateCSSEnd, animateCSSStart, b, timeoutKey;
        if (arguments.length === 3) {
          a = classNames;
          b = arguments[2];
          classNames = {
            enter: a,
            move: a,
            leave: b,
            show: a,
            hide: b,
            addClass: a,
            removeClass: b
          };
        }
        timeoutKey = "$$animate.css-timer";
        animateCSSStart = function(element, className, delay, done) {
          var timer;
          element.addClass(className);
          element.addClass("animated");
          timer = $timeout(done, delay || defaultDelay, false);
          element.data(timeoutKey, timer);
        };
        animateCSSEnd = function(element, className) {
          return function(cancelled) {
            var timer;
            timer = element.data(timeoutKey);
            if (timer) {
              $timeout.cancel(timer);
              element.removeData(timeoutKey);
            }
            element.removeClass(className);
            element.removeClass("animated");
          };
        };
        return {
          enter: function(element, done) {
            animateCSSStart(element, classNames.enter, classNames.delay, done);
            return animateCSSEnd(element, classNames.enter);
          },
          leave: function(element, done) {
            animateCSSStart(element, classNames.leave, classNames.delay, done);
            return animateCSSEnd(element, classNames.leave);
          },
          move: function(element, done) {
            animateCSSStart(element, classNames.move, classNames.delay, done);
            return animateCSSEnd(element, classNames.move);
          },
          beforeAddClass: function(element, className, done) {
            var klass;
            klass = className === "ng-hide" && (classNames.hide || (angular.isFunction(classNames.addClass) ? classNames.addClass(className) : classNames.addClass));
            if (klass) {
              animateCSSStart(element, klass, classNames.delay, done);
              return animateCSSEnd(element, klass);
            }
            done();
          },
          addClass: function(element, className, done) {
            var klass;
            klass = className !== "ng-hide" && (angular.isFunction(classNames.addClass) ? classNames.addClass(className) : classNames.addClass);
            if (klass) {
              animateCSSStart(element, klass, classNames.delay, done);
              return animateCSSEnd(element, klass);
            }
            done();
          },
          removeClass: function(element, className, done) {
            var klass;
            klass = (className === "ng-hide" && classNames.show) || (angular.isFunction(classNames.removeClass) ? classNames.removeClass(className) : classNames.removeClass);
            if (klass) {
              animateCSSStart(element, klass, classNames.delay, done);
              return animateCSSEnd(element, klass);
            }
            done();
          }
        };
      };
    }
  ]).animation(".animate-flip-x", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-flip-x", "flipInX", "flipOutX");
    }
  ]).animation(".animate-flip-y", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-flip-y", "flipInY", "flipOutY");
    }
  ]).animation(".animate-fade", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-fade", "fadeIn", "fadeOut");
    }
  ]).animation(".animate-fade-up", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-fade-up", "fadeInUp", "fadeOutUp");
    }
  ]).animation(".animate-fade-down", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-fade-down", "fadeInDown", "fadeOutDown");
    }
  ]).animation(".animate-fade-left", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-fade-left", "fadeInLeft", "fadeOutLeft");
    }
  ]).animation(".animate-fade-right", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-fade-right", "fadeInRight", "fadeOutRight");
    }
  ]).animation(".animate-fade-up-big", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-fade-up-big", "fadeInUpBig", "fadeOutUpBig");
    }
  ]).animation(".animate-fade-down-big", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-fade-down-big", "fadeInDownBig", "fadeOutDownBig");
    }
  ]).animation(".animate-fade-left-big", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-fade-left-big", "fadeInLeftBig", "fadeOutLeftBig");
    }
  ]).animation(".animate-fade-right-big", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-fade-right-big", "fadeInRightBig", "fadeOutRightBig");
    }
  ]).animation(".animate-bounce", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-bounce", "bounceIn", "bounceOut");
    }
  ]).animation(".animate-bounce-up", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-bounce-up", "bounceInUp", "bounceOutUp");
    }
  ]).animation(".animate-bounce-down", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-bounce-down", "bounceInDown", "bounceOutDown");
    }
  ]).animation(".animate-bounce-left", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-bounce-left", "bounceInLeft", "bounceOutLeft");
    }
  ]).animation(".animate-bounce-right", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-bounce-right", "bounceInRight", "bounceOutRight");
    }
  ]).animation(".animate-rotate", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-rotate", "rotateIn", "rotateOut");
    }
  ]).animation(".animate-rotate-up-left", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-rotate-up-left", "rotateInUpLeft", "rotateOutUpLeft");
    }
  ]).animation(".animate-rotate-down-left", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-rotate-down-left", "rotateInDownLeft", "rotateOutDownLeft");
    }
  ]).animation(".animate-rotate-up-right", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-rotate-up-right", "rotateInUpRight", "rotateOutUpRight");
    }
  ]).animation(".animate-rotate-down-right", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-rotate-down-right", "rotateInDownRight", "rotateOutDownRight");
    }
  ]).animation(".animate-lightspeed", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-lightspeed", "lightSpeedIn", "lightSpeedOut");
    }
  ]).animation(".animate-roll", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-roll", "rollIn", "rollOut");
    }
  ]).animation(".animate-hinge", [
    "animateCSSBuild", function(animateCSSBuild) {
      return animateCSSBuild("animate-hinge", "fadeIn", "hinge");
    }
  ]);

}).call(this);

(function() {
  App.factory('AppInitService', function($rootScope, $window, IntroService, $q, Util, Config, Cache, Constant) {
    var promises;
    promises = [];
    return {
      init: function() {
        var persistenceDefer;
        $rootScope.$on('$routeChangeSuccess', function($event, current) {
          return $rootScope.currentPage = current.name;
        });
        $rootScope.Util = Util;
        $rootScope.config = Config;
        $rootScope.user = angular.fromJson(localStorage.getItem('user'));
        $rootScope.dict = {
          get: function(key) {
            var ret;
            ret = Constant.dict[key];
            if (ret == null) {
              ret = key;
            }
            return ret;
          }
        };
        $rootScope.startIntro = function() {
          return IntroService.start();
        };
        $rootScope.persistence = {};
        persistenceDefer = $q.defer();
        promises.push(persistenceDefer);
        return $rootScope.$watch((function(_this) {
          return function() {
            return angular.toJson($rootScope.persistence);
          };
        })(this), (function(_this) {
          return function(newVal, oldVal) {
            var key;
            key = 'persistent_object';
            if (newVal === oldVal) {
              _.extend($rootScope.persistence, Cache.get(key));
              return persistenceDefer.resolve();
            } else {
              return Cache.set(key, JSON.parse(newVal));
            }
          };
        })(this), true);
      },
      add: function(promise) {
        return promises.push(promise);
      },
      done: function() {
        return $q.all(promises);
      }
    };
  });

}).call(this);

(function() {
  App.factory("breadcrumbs", [
    "$rootScope", "$location", "$route", function($rootScope, $location, $route) {
      var BreadcrumbService;
      BreadcrumbService = {
        breadcrumbs: [],
        get: function() {
          var key, self;
          if (this.options) {
            self = this;
            for (key in this.options) {
              if (this.options.hasOwnProperty(key)) {
                angular.forEach(self.breadcrumbs, function(breadcrumb) {
                  if (breadcrumb.label === key) {
                    breadcrumb.label = self.options[key];
                  }
                });
              }
            }
          }
          return this.breadcrumbs;
        },
        generateBreadcrumbs: function() {
          var getRoute, path, pathElements, routes, self;
          routes = $route.routes;
          pathElements = $location.path().split("/");
          path = "";
          self = this;
          getRoute = function(route) {
            var param;
            param = void 0;
            angular.forEach($route.current.params, function(value, key) {
              var re;
              re = new RegExp(value);
              if (re.test(route)) {
                param = value;
              }
              route = route.replace(re, ":" + key);
            });
            return {
              path: route,
              param: param
            };
          };
          if (pathElements[1] === "") {
            delete pathElements[1];
          }
          this.breadcrumbs = [];
          angular.forEach(pathElements, function(el) {
            var label, route;
            path += (path === "/" ? el : "/" + el);
            route = getRoute(path);
            if (routes[route.path]) {
              label = routes[route.path].label || route.param;
              self.breadcrumbs.push({
                label: label,
                path: path
              });
            }
          });
        }
      };
      $rootScope.$on("$routeChangeSuccess", function() {
        BreadcrumbService.generateBreadcrumbs();
      });
      return BreadcrumbService;
    }
  ]);

}).call(this);

(function() {
  'use strict';
  App.factory('IntroService', function(Config, Cache, $timeout) {
    var cacheKey, initIntro, intro;
    intro = null;
    cacheKey = "" + Config.name + "_IntroService_init";
    initIntro = function() {
      var els, steps;
      if (typeof introJs !== "undefined" && introJs !== null) {
        steps = Config.intros;
        els = document.querySelectorAll('.intro-step');
        steps = _.map(steps, function(step, i) {
          var findEl;
          findEl = _.find(els, function(e) {
            var num;
            e = angular.element(e);
            num = e.attr('intro-step');
            return i === parseInt(num - 1);
          });
          if (findEl) {
            step.element = findEl;
          }
          return step;
        });
        intro = introJs();
        intro.setOptions({
          steps: steps
        });
        return intro.onafterchange(function(targetElement) {
          return intro.refresh();
        });
      }
    };
    return {
      init: function() {
        var isInit, start;
        initIntro();
        isInit = Cache.get(cacheKey);
        if (!isInit) {
          start = this.start;
          return $timeout(function() {
            if (start()) {
              return Cache.set(cacheKey, true);
            }
          }, 1500);
        }
      },
      start: function() {
        if (intro) {
          intro.start();
          return true;
        } else {
          return false;
        }
      }
    };
  });

}).call(this);

(function() {
  'use strict';
  App.factory('LoadingService', function($rootScope, $q, $timeout, Util) {
    return {
      init: function() {
        var loadingDefer;
        loadingDefer = $q.defer();
        $rootScope.$watch((function() {
          return $rootScope.loading;
        }), function() {
          if ($rootScope.loading != null) {
            if ($rootScope.loading === 'loaded') {
              if ($rootScope.loadDialog != null) {
                $rootScope.initializing = 100;
                $timeout(function() {
                  return $rootScope.loadDialog.close();
                }, 1000);
              }
              $rootScope.initiated = true;
              return loadingDefer.resolve();
            }
          } else {
            $rootScope.initializing = 10;
            return $rootScope.loadDialog = Util.createDialog('partials/modal/loading.html', null, angular.noop, {
              backdrop: 'static'
            });
          }
        });
        return loadingDefer.promise;
      },
      done: function() {
        return $rootScope.loading = 'loaded';
      }
    };
  });

}).call(this);

(function() {
  'use strict';
  App.factory('NProgressService', function($timeout) {
    return {
      start: function() {
        if (NProgress) {
          return NProgress.start();
        }
      },
      done: function() {
        if (NProgress) {
          return $timeout(function() {
            return NProgress.done();
          }, 1000);
        }
      }
    };
  });

}).call(this);

(function() {
  'use strict';
  App.factory('PiwikService', function(Config) {
    return {
      init: function(username, pagename) {
        var app, piwikTracker, pkBaseURL, prod, siteId;
        if (typeof Piwik !== "undefined" && Piwik !== null) {
          siteId = Config.piwik.siteId;
          pkBaseURL = Config.piwik.url;
          app = Config.piwik.app;
          prod = Config.piwik.prod;
          piwikTracker = Piwik.getTracker("" + pkBaseURL + "/piwik.php", siteId);
          piwikTracker.setCustomVariable(1, "User", username, "visit");
          piwikTracker.setCustomVariable(2, "App", app, "page");
          piwikTracker.setCustomVariable(3, "PageName", pagename, "page");
          piwikTracker.setCustomVariable(4, "Prod", prod, "page");
          piwikTracker.trackPageView();
          return piwikTracker.enableLinkTracking();
        }
      }
    };
  });

}).call(this);

(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  App.factory('RuleRemoteService', function(Restangular, BaseRemoteService) {
    var RuleRemoteService;
    return new (RuleRemoteService = (function(_super) {
      __extends(RuleRemoteService, _super);

      function RuleRemoteService() {
        RuleRemoteService.__super__.constructor.call(this);
        this.rest = Restangular.all('');
      }

      RuleRemoteService.prototype.query = function(param) {
        console.log("SummaryRemoteService....query");
        return this.doQuery('getsummarycount', param);
      };

      RuleRemoteService.prototype.queryWithCanceler = function(param, canceler) {
        return this.doQuery('test2', param, canceler);
      };

      RuleRemoteService.prototype.queryWithCache = function(param) {
        return this.doQueryWithCache('test3', param, null, 300);
      };

      RuleRemoteService.prototype.queryWithCancelerAndCache = function(param, canceler) {
        return this.doQueryWithCache('test4', param, canceler, 300);
      };

      return RuleRemoteService;

    })(BaseRemoteService));
  });

}).call(this);

(function() {
  'use strict';
  App.factory('BaseRemoteService', function(Config, Restangular, Util, $q, $timeout) {
    var BaseRemoteService;
    return BaseRemoteService = (function() {
      function BaseRemoteService() {
        this.rest = Restangular.all('');
      }

      BaseRemoteService.prototype.getCacheKey = function(method, param) {
        var classMatch, className;
        classMatch = /function\s+(\w+)\(.*\).*/.exec(this.constructor.toString());
        if (classMatch.length === 2) {
          className = classMatch[1];
        }
        return "" + Config.name + "_" + className + "_" + method + "_" + (JSON.stringify(param));
      };

      BaseRemoteService.prototype.getWithCache = function(method, param, func, timeout) {
        if (timeout == null) {
          timeout = 300;
        }
        return Util.getWithCache(this.getCacheKey(method, param), true, func, timeout);
      };

      BaseRemoteService.prototype.doQuery = function(method, param, canceler) {
        var config;
        if (canceler && canceler.promise) {
          config = {
            timeout: canceler.promise
          };
          return this.rest.one(method).withHttpConfig(config).get(param);
        } else {
          return this.rest.one(method).get(param);
        }
      };

      BaseRemoteService.prototype.doQueryWithCache = function(method, param, canceler, timeout) {
        if (timeout == null) {
          timeout = 300;
        }
        return this.getWithCache(method, param, (function(_this) {
          return function() {
            var config;
            if (canceler && canceler.promise) {
              config = {
                timeout: canceler.promise
              };
              return _this.rest.one(method).withHttpConfig(config).get(param);
            } else {
              return _this.rest.one(method).get(param);
            }
          };
        })(this), timeout);
      };

      BaseRemoteService.prototype.mockResult = function(data, time) {
        var defer;
        if (time == null) {
          time = 1000;
        }
        defer = $q.defer();
        $timeout(function() {
          return defer.resolve(data);
        }, time);
        return defer.promise;
      };

      return BaseRemoteService;

    })();
  });

}).call(this);

(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  App.factory('RuleRemoteService', function(Restangular, BaseRemoteService) {
    var RuleRemoteService;
    return new (RuleRemoteService = (function(_super) {
      __extends(RuleRemoteService, _super);

      function RuleRemoteService() {
        RuleRemoteService.__super__.constructor.call(this);
        this.rest = Restangular.all('');
      }

      RuleRemoteService.prototype.getAllRules = function(param) {
        return this.doQuery('get_all_rules', param);
      };

      RuleRemoteService.prototype.queryWithCanceler = function(param, canceler) {
        return this.doQuery('test2', param, canceler);
      };

      RuleRemoteService.prototype.queryWithCache = function(param) {
        return this.doQueryWithCache('test3', param, null, 300);
      };

      RuleRemoteService.prototype.queryWithCancelerAndCache = function(param, canceler) {
        return this.doQueryWithCache('test4', param, canceler, 300);
      };

      return RuleRemoteService;

    })(BaseRemoteService));
  });

}).call(this);

(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  App.factory('SampleRemoteService', function(Restangular, BaseRemoteService) {
    var SampleRemoteService;
    return new (SampleRemoteService = (function(_super) {
      __extends(SampleRemoteService, _super);

      function SampleRemoteService() {
        SampleRemoteService.__super__.constructor.call(this);
        this.rest = Restangular.all('sample');
      }

      SampleRemoteService.prototype.query = function(param) {
        console.log("SampleRemoteService...query");
        return this.doQuery('test1', param);
      };

      SampleRemoteService.prototype.queryWithCanceler = function(param, canceler) {
        return this.doQuery('test2', param, canceler);
      };

      SampleRemoteService.prototype.queryWithCache = function(param) {
        return this.doQueryWithCache('test3', param, null, 300);
      };

      SampleRemoteService.prototype.queryWithCancelerAndCache = function(param, canceler) {
        return this.doQueryWithCache('test4', param, canceler, 300);
      };

      return SampleRemoteService;

    })(BaseRemoteService));
  });

}).call(this);

(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  App.factory('SummaryRemoteService', function(Restangular, BaseRemoteService) {
    var SummaryRemoteService;
    return new (SummaryRemoteService = (function(_super) {
      __extends(SummaryRemoteService, _super);

      function SummaryRemoteService() {
        SummaryRemoteService.__super__.constructor.call(this);
        this.rest = Restangular.all('');
      }

      SummaryRemoteService.prototype.query = function(param) {
        console.log("SummaryRemoteService....query");
        return this.doQuery('getsummarycount', param);
      };

      SummaryRemoteService.prototype.queryWithCanceler = function(param, canceler) {
        return this.doQuery('test2', param, canceler);
      };

      SummaryRemoteService.prototype.queryWithCache = function(param) {
        return this.doQueryWithCache('test3', param, null, 300);
      };

      SummaryRemoteService.prototype.queryWithCancelerAndCache = function(param, canceler) {
        return this.doQueryWithCache('test4', param, canceler, 300);
      };

      return SummaryRemoteService;

    })(BaseRemoteService));
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  App.factory('AllRuleViewModel', function(BaseViewModel, RuleRemoteService) {
    var AllRuleViewModel;
    return AllRuleViewModel = (function(_super) {
      __extends(AllRuleViewModel, _super);

      function AllRuleViewModel() {
        this.bindAction = __bind(this.bindAction, this);
        this.bindView = __bind(this.bindView, this);
        return AllRuleViewModel.__super__.constructor.apply(this, arguments);
      }

      AllRuleViewModel.prototype.bindView = function() {
        var cellTemplate, i;
        this.state.load = 1;
        this.paginationConf = {
          currentPage: 1,
          totalItems: 4567,
          itemsPerPage: 10,
          pagesLength: 10,
          perPageOptions: [10, 20, 30, 40, 50]
        };
        this.data = [];
        i = 1;
        while (i < 122) {
          i++;
          this.data.push(i);
        }
        this.pageBegin = 10;
        this.pageEnd = 15;
        this.ruleList = [];
        cellTemplate = '<input type="checkbox" ng-model="row.entity.ckb" ><span>{{row.entity.id}}</span>';
        return RuleRemoteService.getAllRules({}).then((function(_this) {
          return function(data) {
            console.log("success with data: ", data);
            _this.state.load = 1;
            _this.ruleList = data.map(function(rule) {
              return {
                "id": rule[0],
                "sa_code": rule[12],
                "table_name": rule[17],
                "platform": rule[18].split(","),
                "checktype": rule[20],
                "scheduletype": rule[13],
                "owner": rule[8],
                "status": rule[16]
              };
            });
            return console.log(_this.ruleList);
          };
        })(this), function(err) {
          return console.log("fail with err: ", err);
        });
      };

      AllRuleViewModel.prototype.bindAction = function() {
        return {
          changePageNum: (function(_this) {
            return function(page_num) {
              console.log("#@#");
              return _this.paginationConf.currentPage += 10;
            };
          })(this)
        };
      };

      return AllRuleViewModel;

    })(BaseViewModel);
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  App.factory('BaseViewModel', function($q, $location, PiwikService, $timeout, $rootScope, AppInitService, Config, LoadingService, IntroService, NProgressService) {
    var BaseViewModel;
    return BaseViewModel = (function() {
      function BaseViewModel(scope) {
        this.scope = scope;
        this.pageInit = __bind(this.pageInit, this);
        this.bindAction = __bind(this.bindAction, this);
        this.bindView = __bind(this.bindView, this);
        this.initialize = __bind(this.initialize, this);
        this.state = {};
        this.data = {};
        this.actions = this.bindAction();
        AppInitService.done().then((function(_this) {
          return function() {
            _this.pageInit().then(_this.bindView);
            if (Config.debug === true) {
              window.vm = _this;
              return window.scope = _this.scope;
            }
          };
        })(this));
      }

      BaseViewModel.prototype.initialize = function() {
        var defer;
        defer = $q.defer();
        defer.resolve();
        return defer.promise;
      };

      BaseViewModel.prototype.bindView = function() {};

      BaseViewModel.prototype.bindAction = function() {};

      BaseViewModel.prototype.logout = function() {
        localStorage.clear();
        return $location.url('/logout');
      };

      BaseViewModel.prototype.pageInit = function() {
        var defer;
        defer = $q.defer();
        NProgressService.start();
        this.initialize().then((function(_this) {
          return function() {
            NProgressService.done();
            if (Config.intro.enabled) {
              IntroService.init();
            }
            if (Config.piwik.enabled && _this.scope.user) {
              PiwikService.init(_this.scope.user.nt, $rootScope.currentPage);
            }
            return defer.resolve();
          };
        })(this));
        return defer.promise;
      };

      return BaseViewModel;

    })();
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  App.factory('HomeViewModel', function(BaseViewModel, SampleRemoteService) {
    var HomeViewModel;
    return HomeViewModel = (function(_super) {
      __extends(HomeViewModel, _super);

      function HomeViewModel() {
        this.bindAction = __bind(this.bindAction, this);
        this.bindView = __bind(this.bindView, this);
        return HomeViewModel.__super__.constructor.apply(this, arguments);
      }

      HomeViewModel.prototype.bindView = function() {
        this.data.announcements = [
          {
            date: "2014-01-01",
            msg: "this is a test"
          }
        ];
        return SampleRemoteService.query("test").then(function(data) {
          return console.log("success with data: ", data);
        }, function(err) {
          return console.log("fail with err: ", err);
        });
      };

      HomeViewModel.prototype.bindAction = function() {};

      return HomeViewModel;

    })(BaseViewModel);
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  App.factory('SummaryViewModel', function(BaseViewModel, SummaryRemoteService) {
    var SummaryViewModel;
    return SummaryViewModel = (function(_super) {
      __extends(SummaryViewModel, _super);

      function SummaryViewModel() {
        this.bindAction = __bind(this.bindAction, this);
        this.bindView = __bind(this.bindView, this);
        return SummaryViewModel.__super__.constructor.apply(this, arguments);
      }

      SummaryViewModel.prototype.bindView = function() {
        this.data.announcements = [
          {
            date: "2014-01-01",
            msg: "this is a test"
          }
        ];
        return SummaryRemoteService.query({
          "type": "Other"
        }).then(function(data) {
          return console.log("success with data: ", data);
        }, function(err) {
          return console.log("fail with err: ", err);
        });
      };

      SummaryViewModel.prototype.bindAction = function() {};

      return SummaryViewModel;

    })(BaseViewModel);
  });

}).call(this);
