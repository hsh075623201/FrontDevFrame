/**
 * ui-component
 * @version v0.2.21 - 2015-02-03
 * @link https://github.corp.ebay.com/opsins/ui-component
 * @author Martin Liu (hualiu@ebay.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';
angular.module('ui-component.user').run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('user/user.popup.tpl.html', '<div class="ui-user popover fade in"><div class="arrow"></div><div class="popover-inner"><div class="popover-content"><ui-loading ng-if="!loaded"></ui-loading><div ng-if="loaded && !user" style="text-align:center">No Result</div><div ng-if="loaded && user" class="row" bindonce="user"><img class="col-xs-3 user-img" bo-alt="user.fullName" bo-src-i="https://doe.corp.ebay.com/images/ldap/{{user.nt}}.jpg"><div class="col-xs-9 form-horizontal user-info"><div><a target="_blank" bo-href-i="http://thehub.corp.ebay.com/sites/search/pages/peopleresults.aspx?k={{user.nt}}"><div class="user-name" bo-bind="user.fullName"></div></a><div class="user-name-sub" bo-bind="user.eBayPositionText"></div><div class="user-name-sub" bo-bind="user.department"></div><div class="user-name-sub" bo-bind="user.eBaySite"></div></div><div><div><strong>NT</strong>: <span bo-bind="user.nt"></span></div><div><strong>Email</strong>: <a bo-href-i="mailto:{{user.mail}}" bo-bind="user.mail"></a></div><div><strong>Phone</strong>: <span bo-bind="user.telephoneNumber"></span></div><div><strong>Manager</strong>: <a target="_blank" bo-href-i="http://thehub.corp.ebay.com/sites/search/pages/peopleresults.aspx?k={{user.manager.nt}}" bo-bind="user.manager.fullName"></a></div></div></div></div></div></div></div>');
  }
]);