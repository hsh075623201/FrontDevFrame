/**
 * ui-component
 * @version v0.2.21 - 2015-02-03
 * @link https://github.corp.ebay.com/opsins/ui-component
 * @author Martin Liu (hualiu@ebay.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';
angular.module('ui-component.side-menu', ['ui-component.deps']).directive('uiSideMenu', [
  '$q',
  '$location',
  '$http',
  '$window',
  '$timeout',
  '$rootScope',
  function ($q, $location, $http, $window, $timeout, $rootScope) {
    var cacheMinifiedKey = 'opsins_side_menu_minified';
    var cacheActiveKey = 'opsins_side_menu_active';
    var cacheListKey = 'opsins_side_menu_List_Load';
    function piwik_track(username, app, pagename, prod, siteId) {
      var piwikTracker, pkBaseURL;
      if (typeof Piwik !== 'undefined' && Piwik !== null) {
        pkBaseURL = ('https:' === document.location.protocol ? 'https' : 'http') + '://opspiwik.corp.ebay.com/piwik/';
        piwikTracker = Piwik.getTracker('' + pkBaseURL + '/piwik.php', siteId);
        // 1 is the website ID, replace it with your site ID
        piwikTracker.setCustomVariable(1, 'User', username, 'visit');
        // 1 is custom variable id, no need to change it. This line is to add custom variable "User"
        piwikTracker.setCustomVariable(2, 'App', app, 'page');
        piwikTracker.setCustomVariable(3, 'PageName', pagename, 'page');
        piwikTracker.setCustomVariable(4, 'Prod', prod, 'page');
        piwikTracker.trackPageView();
        return piwikTracker.enableLinkTracking();
      }
    }
    ;
    function bindScope(scope) {
      scope.triggerMinify = function () {
        scope.minified = !scope.minified;
        sessionStorage.setItem(cacheMinifiedKey, scope.minified);
        $rootScope.$emit('ui-component.side-menu.trigger-minified', scope.minified);
      };
      scope.setActive = function (li) {
        if (scope.active != li.id) {
          scope.active = li.id;
          sessionStorage.setItem(cacheActiveKey, scope.active);
          // Set display mode
          if (li.notReady) {
            scope.mode = 'comingSoon';
          } else if (li.iframe) {
            scope.mode = 'iframe';
            var iframe = document.querySelector('iframe.capacity-dash');
            iframe.src = li.iframe.src;
          } else {
            scope.mode = null;
          }
          // Set piwik
          if ($rootScope.user && li.piwik) {
            piwik_track($rootScope.user.nt, li.piwik.app, li.piwik.page, li.piwik.prod, li.piwik.siteId);
          }
          li.showSubMenu = true;
        } else {
          li.showSubMenu = !li.showSubMenu;
        }
      };
      scope.isActive = function (li) {
        var active = null;
        if (scope.active) {
          var hierarchy = scope.active.split('_');
          if (hierarchy.length > 1) {
            active = hierarchy[0] == li.id;
          }
        }
        return active || scope.active == li.id;
      };
      scope.isExpand = function (li) {
        var expand = null;
        if (scope.active) {
          var hierarchy = scope.active.split('_');
          if (hierarchy.length > 1) {
            expand = hierarchy[0] == li.id;
          }
        }
        return expand || li.showSubMenu;
      };
      scope.processUrl = function (url) {
        // when uses hash in url
        if (url && !$location.$$html5) {
          if (url.indexOf('/') == 0) {
            var pos = url.indexOf(location.pathname);
            if (pos > -1) {
              url = url.replace(location.pathname, '#!');
            }
          }
        }
        return url;
      };
    }
    function getListData(scope) {
      var defer = $q.defer();
      var list = sessionStorage.getItem(cacheListKey);
      if (!list) {
        var url;
        if (scope.sourceUrl) {
          url = scope.sourceUrl;
        } else if (typeof Config != 'undefined' && Config.uri && Config.uri.api) {
          url = Config.uri.api + 'uicomponent/getsidemenu';
        } else {
          url = 'https://doe.corp.ebay.com/api/uicomponent/getsidemenu';
        }
        $http({
          method: 'GET',
          url: url
        }).success(function (data, status, headers, config) {
          if (data && data.length) {
            var list = data[0].list;
            scope.list = angular.fromJson(list);
            if (list) {
              sessionStorage.setItem(cacheListKey, list);
            }
            defer.resolve();
          }
        });
      } else {
        scope.list = angular.fromJson(list);
        defer.resolve();
      }
      return defer.promise;
    }
    return {
      restrict: 'EAC',
      templateUrl: 'side-menu/side-menu.tpl.html',
      scope: { sourceUrl: '=' },
      transclude: true,
      link: function postLink(scope, el, attr, transclusion) {
        bindScope(scope);
        scope.minified = sessionStorage.getItem(cacheMinifiedKey) == 'true';
        var activeLi = sessionStorage.getItem(cacheActiveKey);
        function initActive(l) {
          if (activeLi) {
            if (l.id == activeLi) {
              scope.setActive(l);
            }
          } else {
            var absUrl = $location.absUrl().replace(/\?.*/, '');
            var pathname = location.pathname;
            if (absUrl == l.url || pathname == l.url) {
              scope.setActive(l);
            }
          }
        }
        function doInitActive(list) {
          angular.forEach(list, function (l) {
            initActive(l);
            if (l.submenu && l.submenu.length) {
              doInitActive(l.submenu);
            }
          });
        }
        getListData(scope).then(function () {
          doInitActive(scope.list);
          if (!scope.active) {
            scope.setActive(scope.list[0]);
          }
        });
      }
    };
  }
]);