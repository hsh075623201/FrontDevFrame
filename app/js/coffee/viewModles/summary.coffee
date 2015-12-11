App.factory 'SummaryViewModel', (BaseViewModel, SummaryRemoteService) ->

  class SummaryViewModel extends BaseViewModel
    ## Override
    bindView : =>
      @data.announcements = [
        {
          date: "2014-01-01"
          msg: "this is a test"
        }
      ]
      SummaryRemoteService.query({"type":"Other"}).then (data)->
        console.log "success with data: ", data
      , (err)->
        console.log "fail with err: ", err

    ## Override
    bindAction: =>