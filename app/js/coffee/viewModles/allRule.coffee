App.factory 'AllRuleViewModel', (BaseViewModel, RuleRemoteService) ->

  class AllRuleViewModel extends BaseViewModel
    ## Override
    bindView : =>
      
      @state.load = 1
      @paginationConf = 
        currentPage: 1
        totalItems: 4567
        itemsPerPage: 10
        pagesLength: 10
        perPageOptions: [10, 20, 30, 40, 50]
      @data = []
     
      i=1
      while i<122
        i++
        @data.push i
      @pageBegin = 10
      @pageEnd = 15
      @ruleList=[]
      cellTemplate = '<input type="checkbox" ng-model="row.entity.ckb" ><span>{{row.entity.id}}</span>';
      RuleRemoteService.getAllRules({}).then (data)=>
        console.log "success with data: ", data
        @state.load = 1
        @ruleList = data.map (rule)=>
          {"id":rule[0],"sa_code":rule[12],"table_name":rule[17],"platform":rule[18].split(","),"checktype":rule[20],"scheduletype":rule[13],"owner":rule[8],"status":rule[16]}
        console.log @ruleList
        
      , (err)->
        console.log "fail with err: ", err

    ## Override
    bindAction: =>
      changePageNum:(page_num)=>
        console.log "#@#"
        @paginationConf.currentPage +=10
