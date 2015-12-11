'use strict'
App.factory 'SummaryRemoteService', (Restangular, BaseRemoteService) ->
  new class SummaryRemoteService extends BaseRemoteService
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