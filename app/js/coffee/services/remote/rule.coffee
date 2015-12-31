'use strict'
App.factory 'RuleRemoteService', (Restangular, BaseRemoteService) ->
  new class RuleRemoteService extends BaseRemoteService
    constructor: ->
      super()
      @rest = Restangular.all('')

    getAllRules: (param)->
      @doQuery 'get_all_rules', param
    
    save:(param)->
      @doPost 'save',param
    
    queryWithCanceler: (param, canceler)->
      @doQuery 'test2', param, canceler

    queryWithCache: (param)->
      @doQueryWithCache 'test3', param, null, 300

    queryWithCancelerAndCache: (param, canceler)->
      @doQueryWithCache 'test4', param, canceler, 300
