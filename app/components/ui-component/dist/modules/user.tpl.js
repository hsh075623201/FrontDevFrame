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
    $templateCache.put('user/user.tpl.html', '<i class="fa fa-user" style="color: #0074bc"></i>');
  }
]);