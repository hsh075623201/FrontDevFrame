/**
 * ui-component
 * @version v0.2.21 - 2015-02-03
 * @link https://github.corp.ebay.com/opsins/ui-component
 * @author Martin Liu (hualiu@ebay.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
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