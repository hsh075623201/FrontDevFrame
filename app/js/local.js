'use strict';

// This is used for local env
App.run(function($http, $rootScope) {
  // Init user
  var user = {
    nt : 'sihhuang',
    firstName : 'Sihao',
    lastName : 'Huang',
    displayName : 'Huang, Sihao',
    label : 'Huang, Sihao(sihhuang)'
  };
  $rootScope.user = user;
  $rootScope.initiated = true;


  // Init debug information
  window.scope = $rootScope;
});
