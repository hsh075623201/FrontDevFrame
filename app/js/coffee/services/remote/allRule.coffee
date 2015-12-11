'use strict'
App.factory 'RuleRemoteService', (Restangular, BaseRemoteService) ->
  new class RuleRemoteService extends BaseRemoteService
    constructor: ->
      super()
      @rest = Restangular.all('')

    query: (param)->
      console.log "SummaryRemoteService....query"
      @doQuery 'getsummarycount', param

    queryWithCanceler: (param, canceler)->
      @doQuery 'test2', param, canceler

    queryWithCache: (param)->
      @doQueryWithCache 'test3', param, null, 300

    queryWithCancelerAndCache: (param, canceler)->
      @doQueryWithCache 'test4', param, canceler, 300