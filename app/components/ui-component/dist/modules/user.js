/**
 * ui-component
 * @version v0.2.21 - 2015-02-03
 * @link https://github.corp.ebay.com/opsins/ui-component
 * @author Martin Liu (hualiu@ebay.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';
angular.module('ui-component.user', ['ui-component.deps']).directive('uiUser', [
  '$q',
  '$timeout',
  '$http',
  '$position',
  '$templateCache',
  '$compile',
  '$document',
  'RecursionHelper',
  'HoverDelayService',
  function ($q, $timeout, $http, $position, $templateCache, $compile, $document, RecursionHelper, HoverDelayService) {
    function getApiUrl(personnelId, nt) {
      var url, uri;
      if (personnelId) {
        uri = 'solr/get?core=ldap&eBayPersonnelID=' + personnelId;
      } else if (nt) {
        uri = 'solr/get?core=ldap&nt=' + nt;
      }
      url = 'https://doe.corp.ebay.com/api/' + uri;
      return url;
    }
    function getUserData(url) {
      var defer = $q.defer();
      $http({
        method: 'GET',
        url: url
      }).success(function (data, status, headers, config) {
        if (data && data.response && data.response.docs && data.response.docs.length) {
          var user = data.response.docs[0];
          user.fullName = user.last_name + ', ' + user.preferred_name;
          defer.resolve(user);
        } else {
          defer.resolve();
        }
      });
      return defer.promise;
    }
    function initUser(scope) {
      var url;
      var defer = $q.defer();
      if (scope.sourceUrl) {
        url = scope.sourceUrl + scope.nt;
      } else {
        url = getApiUrl(null, scope.nt);
      }
      scope.show = true;
      scope.loaded = false;
      getUserData(url).then(function (data) {
        if (data && data.eBayManagerID) {
          var apiUrl = getApiUrl(data.eBayManagerID);
          getUserData(apiUrl).then(function (ret) {
            scope.user = data;
            scope.loaded = true;
            scope.user.manager = ret;
            defer.resolve();
          });
        } else {
          if (data) {
            scope.user = data;
          }
          scope.loaded = true;
          defer.resolve();
        }
      });
      return defer.promise;
    }
    var link = {
        post: function (scope, element, attrs) {
          var div;
          var icon = element.find('i');
          var appendToBody = attrs.appendToBody == 'true';
          var initDiv = function () {
            if (!div) {
              var popupTpl = $templateCache.get('user/user.popup.tpl.html');
              div = $compile(popupTpl)(scope);
              if (appendToBody) {
                $document.find('body').append(div);
              } else {
                element.append(div);
              }
              if (appendToBody) {
                div.bind('mouseenter', function () {
                  div.css('display', 'block');
                });
                div.bind('mouseleave', function () {
                  div.css('display', 'none');
                });
              }
            }
          };
          var adjustPopover = function (forceShow) {
            var ttPosition;
            var placement = attrs.placement || 'top';
            if (forceShow) {
              div.css('display', 'block');
            }
            div.addClass(placement);
            ttPosition = $position.positionElements(icon, div, placement, appendToBody);
            ttPosition.top += 'px';
            ttPosition.left += 'px';
            div.css(ttPosition);
          };
          var hoverDelay = HoverDelayService.newInstance(300);
          element.bind('mouseenter', function () {
            hoverDelay.register(function () {
              initDiv();
              adjustPopover(true);
              if (!scope.loaded) {
                initUser(scope).then(function () {
                  $timeout(adjustPopover);
                });
              }
            });
          });
          element.bind('mouseleave', function () {
            hoverDelay.clear();
            div.css('display', 'none');
          });
          return scope.$on('$destroy', function () {
            hoverDelay.close(0);
            element.unbind('mouseenter');
            element.unbind('mouseleave');
            if (div) {
              div.unbind('mouseenter');
              div.unbind('mouseleave');
            }
          });
        }
      };
    return {
      restrict: 'EA',
      templateUrl: 'user/user.tpl.html',
      scope: {
        sourceUrl: '=',
        nt: '='
      },
      compile: function (element) {
        return RecursionHelper.compile(element, link);
      }
    };
  }
]);