/**
 * ui-component
 * @version v0.2.21 - 2015-02-03
 * @link https://github.corp.ebay.com/opsins/ui-component
 * @author Martin Liu (hualiu@ebay.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(window, document, undefined) {
'use strict';
// Source: bindonce.js
(function () {
/**
  * Bindonce - Zero watches binding for AngularJs
  * @version v0.3.1
  * @link https://github.com/Pasvaz/bindonce
  * @author Pasquale Vazzana <pasqualevazzana@gmail.com>
  * @license MIT License, http://www.opensource.org/licenses/MIT
  */
  var bindonceModule = angular.module('pasvaz.bindonce', []);
  bindonceModule.directive('bindonce', function () {
    var toBoolean = function (value) {
      if (value && value.length !== 0) {
        var v = angular.lowercase('' + value);
        value = !(v === 'f' || v === '0' || v === 'false' || v === 'no' || v === 'n' || v === '[]');
      } else {
        value = false;
      }
      return value;
    };
    var msie = parseInt((/msie (\d+)/.exec(angular.lowercase(navigator.userAgent)) || [])[1], 10);
    if (isNaN(msie)) {
      msie = parseInt((/trident\/.*; rv:(\d+)/.exec(angular.lowercase(navigator.userAgent)) || [])[1], 10);
    }
    var bindonceDirective = {
        restrict: 'AM',
        controller: [
          '$scope',
          '$element',
          '$attrs',
          '$interpolate',
          function ($scope, $element, $attrs, $interpolate) {
            var showHideBinder = function (elm, attr, value) {
              var show = attr === 'show' ? '' : 'none';
              var hide = attr === 'hide' ? '' : 'none';
              elm.css('display', toBoolean(value) ? show : hide);
            };
            var classBinder = function (elm, value) {
              if (angular.isObject(value) && !angular.isArray(value)) {
                var results = [];
                angular.forEach(value, function (value, index) {
                  if (value)
                    results.push(index);
                });
                value = results;
              }
              if (value) {
                elm.addClass(angular.isArray(value) ? value.join(' ') : value);
              }
            };
            var transclude = function (transcluder, scope) {
              transcluder.transclude(scope, function (clone) {
                var parent = transcluder.element.parent();
                var afterNode = transcluder.element && transcluder.element[transcluder.element.length - 1];
                var parentNode = parent && parent[0] || afterNode && afterNode.parentNode;
                var afterNextSibling = afterNode && afterNode.nextSibling || null;
                angular.forEach(clone, function (node) {
                  parentNode.insertBefore(node, afterNextSibling);
                });
              });
            };
            var ctrl = {
                watcherRemover: undefined,
                binders: [],
                group: $attrs.boName,
                element: $element,
                ran: false,
                addBinder: function (binder) {
                  this.binders.push(binder);
                  // In case of late binding (when using the directive bo-name/bo-parent)
                  // it happens only when you use nested bindonce, if the bo-children
                  // are not dom children the linking can follow another order
                  if (this.ran) {
                    this.runBinders();
                  }
                },
                setupWatcher: function (bindonceValue) {
                  var that = this;
                  this.watcherRemover = $scope.$watch(bindonceValue, function (newValue) {
                    if (newValue === undefined)
                      return;
                    that.removeWatcher();
                    that.checkBindonce(newValue);
                  }, true);
                },
                checkBindonce: function (value) {
                  var that = this, promise = value.$promise ? value.$promise.then : value.then;
                  // since Angular 1.2 promises are no longer
                  // undefined until they don't get resolved
                  if (typeof promise === 'function') {
                    promise(function () {
                      that.runBinders();
                    });
                  } else {
                    that.runBinders();
                  }
                },
                removeWatcher: function () {
                  if (this.watcherRemover !== undefined) {
                    this.watcherRemover();
                    this.watcherRemover = undefined;
                  }
                },
                runBinders: function () {
                  while (this.binders.length > 0) {
                    var binder = this.binders.shift();
                    if (this.group && this.group != binder.group)
                      continue;
                    var value = binder.scope.$eval(binder.interpolate ? $interpolate(binder.value) : binder.value);
                    switch (binder.attr) {
                    case 'boIf':
                      if (toBoolean(value)) {
                        transclude(binder, binder.scope.$new());
                      }
                      break;
                    case 'boSwitch':
                      var selectedTranscludes, switchCtrl = binder.controller[0];
                      if (selectedTranscludes = switchCtrl.cases['!' + value] || switchCtrl.cases['?']) {
                        binder.scope.$eval(binder.attrs.change);
                        angular.forEach(selectedTranscludes, function (selectedTransclude) {
                          transclude(selectedTransclude, binder.scope.$new());
                        });
                      }
                      break;
                    case 'boSwitchWhen':
                      var ctrl = binder.controller[0];
                      ctrl.cases['!' + binder.attrs.boSwitchWhen] = ctrl.cases['!' + binder.attrs.boSwitchWhen] || [];
                      ctrl.cases['!' + binder.attrs.boSwitchWhen].push({
                        transclude: binder.transclude,
                        element: binder.element
                      });
                      break;
                    case 'boSwitchDefault':
                      var ctrl = binder.controller[0];
                      ctrl.cases['?'] = ctrl.cases['?'] || [];
                      ctrl.cases['?'].push({
                        transclude: binder.transclude,
                        element: binder.element
                      });
                      break;
                    case 'hide':
                    case 'show':
                      showHideBinder(binder.element, binder.attr, value);
                      break;
                    case 'class':
                      classBinder(binder.element, value);
                      break;
                    case 'text':
                      binder.element.text(value);
                      break;
                    case 'html':
                      binder.element.html(value);
                      break;
                    case 'style':
                      binder.element.css(value);
                      break;
                    case 'src':
                      binder.element.attr(binder.attr, value);
                      if (msie)
                        binder.element.prop('src', value);
                      break;
                    case 'attr':
                      angular.forEach(binder.attrs, function (attrValue, attrKey) {
                        var newAttr, newValue;
                        if (attrKey.match(/^boAttr./) && binder.attrs[attrKey]) {
                          newAttr = attrKey.replace(/^boAttr/, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                          newValue = binder.scope.$eval(binder.attrs[attrKey]);
                          binder.element.attr(newAttr, newValue);
                        }
                      });
                      break;
                    case 'href':
                    case 'alt':
                    case 'title':
                    case 'id':
                    case 'value':
                      binder.element.attr(binder.attr, value);
                      break;
                    }
                  }
                  this.ran = true;
                }
              };
            return ctrl;
          }
        ],
        link: function (scope, elm, attrs, bindonceController) {
          var value = attrs.bindonce && scope.$eval(attrs.bindonce);
          if (value !== undefined) {
            bindonceController.checkBindonce(value);
          } else {
            bindonceController.setupWatcher(attrs.bindonce);
            elm.bind('$destroy', bindonceController.removeWatcher);
          }
        }
      };
    return bindonceDirective;
  });
  angular.forEach([
    {
      directiveName: 'boShow',
      attribute: 'show'
    },
    {
      directiveName: 'boHide',
      attribute: 'hide'
    },
    {
      directiveName: 'boClass',
      attribute: 'class'
    },
    {
      directiveName: 'boText',
      attribute: 'text'
    },
    {
      directiveName: 'boBind',
      attribute: 'text'
    },
    {
      directiveName: 'boHtml',
      attribute: 'html'
    },
    {
      directiveName: 'boSrcI',
      attribute: 'src',
      interpolate: true
    },
    {
      directiveName: 'boSrc',
      attribute: 'src'
    },
    {
      directiveName: 'boHrefI',
      attribute: 'href',
      interpolate: true
    },
    {
      directiveName: 'boHref',
      attribute: 'href'
    },
    {
      directiveName: 'boAlt',
      attribute: 'alt'
    },
    {
      directiveName: 'boTitle',
      attribute: 'title'
    },
    {
      directiveName: 'boId',
      attribute: 'id'
    },
    {
      directiveName: 'boStyle',
      attribute: 'style'
    },
    {
      directiveName: 'boValue',
      attribute: 'value'
    },
    {
      directiveName: 'boAttr',
      attribute: 'attr'
    },
    {
      directiveName: 'boIf',
      transclude: 'element',
      terminal: true,
      priority: 1000
    },
    {
      directiveName: 'boSwitch',
      require: 'boSwitch',
      controller: function () {
        this.cases = {};
      }
    },
    {
      directiveName: 'boSwitchWhen',
      transclude: 'element',
      priority: 800,
      require: '^boSwitch'
    },
    {
      directiveName: 'boSwitchDefault',
      transclude: 'element',
      priority: 800,
      require: '^boSwitch'
    }
  ], function (boDirective) {
    var childPriority = 200;
    return bindonceModule.directive(boDirective.directiveName, function () {
      var bindonceDirective = {
          priority: boDirective.priority || childPriority,
          transclude: boDirective.transclude || false,
          terminal: boDirective.terminal || false,
          require: ['^bindonce'].concat(boDirective.require || []),
          controller: boDirective.controller,
          compile: function (tElement, tAttrs, transclude) {
            return function (scope, elm, attrs, controllers) {
              var bindonceController = controllers[0];
              var name = attrs.boParent;
              if (name && bindonceController.group !== name) {
                var element = bindonceController.element.parent();
                bindonceController = undefined;
                var parentValue;
                while (element[0].nodeType !== 9 && element.length) {
                  if ((parentValue = element.data('$bindonceController')) && parentValue.group === name) {
                    bindonceController = parentValue;
                    break;
                  }
                  element = element.parent();
                }
                if (!bindonceController) {
                  throw new Error('No bindonce controller: ' + name);
                }
              }
              bindonceController.addBinder({
                element: elm,
                attr: boDirective.attribute || boDirective.directiveName,
                attrs: attrs,
                value: attrs[boDirective.directiveName],
                interpolate: boDirective.interpolate,
                group: name,
                transclude: transclude,
                controller: controllers.slice(1),
                scope: scope
              });
            };
          }
        };
      return bindonceDirective;
    });
  });
}());

// Source: module.js
angular.module('ui-component.base', []);
angular.module('ui-component.deps', [
  'pasvaz.bindonce',
  'ui-component.base'
]);
angular.module('ui-component', [
  'ui-component.side-menu',
  'ui-component.user'
]);

// Source: base.js
angular.module('ui-component.base').factory('RecursionHelper', [
  '$compile',
  function ($compile) {
    return {
      compile: function (element, link) {
        // Normalize the link parameter
        if (angular.isFunction(link)) {
          link = { post: link };
        }
        // Break the recursion loop by removing the contents
        var contents = element.contents().remove();
        var compiledContents;
        return {
          pre: link && link.pre ? link.pre : null,
          post: function (scope, element) {
            // Compile the contents
            if (!compiledContents) {
              compiledContents = $compile(contents);
            }
            // Re-add the compiled contents to the element
            compiledContents(scope, function (clone) {
              element.append(clone);
            });
            // Call the post-linking function, if any
            if (link && link.post) {
              link.post.apply(null, arguments);
            }
          }
        };
      }
    };
  }
]);
angular.module('ui-component.base').factory('$position', [
  '$document',
  '$window',
  function ($document, $window) {
    function getStyle(el, cssprop) {
      if (el.currentStyle) {
        //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }
    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static') === 'static';
    }
    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };
    return {
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = {
            top: 0,
            left: 0
          };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },
      positionElements: function (hostEl, targetEl, positionStr, appendToBody) {
        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';
        var hostElPos, targetElWidth, targetElHeight, targetElPos;
        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);
        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');
        var shiftWidth = {
            center: function () {
              return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
            },
            left: function () {
              return hostElPos.left;
            },
            right: function () {
              return hostElPos.left + hostElPos.width;
            }
          };
        var shiftHeight = {
            center: function () {
              return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
            },
            top: function () {
              return hostElPos.top;
            },
            bottom: function () {
              return hostElPos.top + hostElPos.height;
            }
          };
        switch (pos0) {
        case 'right':
          targetElPos = {
            top: shiftHeight[pos1](),
            left: shiftWidth[pos0]()
          };
          break;
        case 'left':
          targetElPos = {
            top: shiftHeight[pos1](),
            left: hostElPos.left - targetElWidth
          };
          break;
        case 'bottom':
          targetElPos = {
            top: shiftHeight[pos0](),
            left: shiftWidth[pos1]()
          };
          break;
        default:
          targetElPos = {
            top: hostElPos.top - targetElHeight,
            left: shiftWidth[pos1]()
          };
          break;
        }
        return targetElPos;
      }
    };
  }
]);
angular.module('ui-component.base').factory('HoverDelayService', function () {
  function hoverEventSyncer(duration) {
    var clear, close, closed, closedTimer, register, timer;
    timer = null;
    closed = false;
    closedTimer = null;
    register = function (func) {
      if (closed) {
        return;
      }
      clearTimeout(timer);
      return timer = setTimeout(func, duration);
    };
    clear = function () {
      return clearTimeout(timer);
    };
    close = function (msec) {
      clearTimeout(timer);
      clearTimeout(closedTimer);
      closed = true;
      return closedTimer = setTimeout(function () {
        return closed = false;
      }, msec);
    };
    return {
      register: register,
      clear: clear,
      close: close
    };
  }
  return {
    newInstance: function (duration) {
      return hoverEventSyncer(duration);
    }
  };
});
angular.module('ui-component.base').directive('uiLoading', function () {
  return {
    restrict: 'E',
    scope: {},
    template: '<div class="ui-loading">\n<i class="fa fa-spinner fa-spin pull-left">\n</i>\n<h4>{{ text }}</h4>\n</div>',
    link: function (scope, element, attrs) {
      scope.text = attrs.text;
      return scope.text != null ? scope.text : scope.text = 'Loading...';
    }
  };
});

// Source: side-menu.js
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

// Source: user.js
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

})(window, document);
