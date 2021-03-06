/**
 * ui-component
 * @version v0.2.21 - 2015-02-03
 * @link https://github.corp.ebay.com/opsins/ui-component
 * @author Martin Liu (hualiu@ebay.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';
angular.module('ui-component.side-menu').run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('side-menu/side-menu.tpl.html', '<div class="side-menu" bindonce="list"><div class="table-row"><div class="col-xs-2 left-sidebar table-cell" ng-class="{minified:minified}"><div class="fixedList" ng-class="{\'col-xs-2\':!minified}"><nav class="main-nav"><ul class="main-menu"><li ng-repeat="li in list" ng-class="{\'side-menu-active\':isActive(li)}"><a bo-class="{\'not-ready\':li.notReady}" ng-click="setActive(li)" bo-href="processUrl(li.url)"><i bo-attr bo-attr-class="li.iconClass"></i> <span class="text" bo-bind="li.text"></span> <i bo-if="li.submenu" class="toggle-icon fa {{isExpand(li) ? \'fa-angle-down\' : \'fa-angle-right\'}}"></i></a><ul class="sub-menu" bo-if="li.submenu" ng-show="isExpand(li)"><li ng-repeat="l in li.submenu" ng-class="{\'side-menu-active\':isActive(l)}"><a bo-class="{\'not-ready\':l.notReady}" ng-click="setActive(l)" bo-href="processUrl(l.url)"><span class="text" bo-bind="l.text"></span></a></li></ul></li></ul></nav><div class="sidebar-minified" ng-click="triggerMinify()"><i class="fa fa-angle-left" ng-class="{\'fa-angle-left\':!minified,\'fa-angle-right\':minified}"></i></div></div><div class="sidebar-content"><div class="img-dss" style="position: fixed;\n' + '             left: 4%;\n' + '             display: block;\n' + '             bottom: 0;\n' + '             width: 147px;\n' + '             height: 81px;\n' + '             background-size: 147px"></div></div></div><div class="{{minified ? \'col-xs-12 expanded\' : \'col-xs-10\'}} content-wrapper table-cell"><div ng-show="mode == \'comingSoon\'" class="coming-soon"><i class="img-coming-soon" style="background-size:320px;width:320px;height:300px; margin: 100px auto 0 auto; display: block"></i></div><iframe ng-show="mode == \'iframe\'" class="capacity-dash" style="width:100%;height:1000px"></iframe><div ng-hide="mode" class="right-content"><div ng-transclude></div></div></div><div class="clearfix"></div></div></div>');
  }
]);