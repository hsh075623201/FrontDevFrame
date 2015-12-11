angular.module('m-directive').directive 'mPagination', ($parse, $q) ->
  return {
    restrict: 'EA'
    scope:
      conf: '=conf'
    replace: true
    templateUrl: 'partials/directive/pagination.html'
    link: (scope, element, attrs) ->
      # change current page
      ###scope.conf = 
        currentPage: 1
        totalItems: 423
        itemsPerPage: 10
        pagesLength: 9
        perPageOptions: [10, 20, 30, 40, 50]###
      scope.changeCurrentPage = (item) ->
        if item=='...'
          return
        else
          scope.conf.currentPage = item
      # define pagination length must be odd
      scope.conf.pagesLength = if parseInt(scope.conf.pagesLength) then parseInt(scope.conf.pagesLength) else 9 
      if scope.conf.pagesLength%2 ==0
        scope.conf.pagesLength = scope.conf.pagesLength-1
      # default perPageOptions
      if !scope.conf.perPageOptions
        scope.conf.perPageOptions = [10,20,30,50]
      #pageList 
      getPagination = (newValue,oldValue) ->
        scope.conf.currentPage = if parseInt(scope.conf.currentPage) then parseInt(scope.conf.currentPage) else 1
        scope.conf.totalItems = if parseInt(scope.conf.totalItems) then parseInt(scope.conf.totalItems) else 0
        scope.conf.itemsPerPage = if parseInt(scope.conf.itemsPerPage) then parseInt(scope.conf.itemsPerPage) else scope.conf.perPageOptions[0]
        scope.conf.numberOfPages = Math.ceil(scope.conf.totalItems/scope.conf.itemsPerPage);
        if scope.conf.currentPage<1
          scope.conf.currentPage =1
        if scope.conf.numberOfPages>0 && scope.conf.currentPage>scope.conf.numberOfPages
          scope.conf.currentPage=scope.conf.numberOfPages
        scope.jumpPageNum = scope.conf.currentPage
        #todo list.. if itemPerPage not in perPageOptions then add it to perPageOption, and sort it last
        scope.pageList = []
        if scope.conf.numberOfPages<=scope.conf.pagesLength
          scope.pageList.push i for i in [1..scope.conf.numberOfPages]
        else
          offset = (scope.conf.pagesLength-1)/2
          if scope.conf.currentPage<=offset
            scope.pageList.push i for i in [1..(offset+1)]
            scope.pageList.push '...'
            scope.pageList.push scope.conf.numberOfPages
          else if scope.conf.currentPage>scope.conf.numberOfPages-offset
            scope.pageList.push 1
            scope.pageList.push '...'
            scope.pageList.push scope.conf.numberOfPages-i for i in [(offset+1)..1]
            scope.pageList.push scope.conf.numberOfPages
          else
            scope.pageList.push 1
            scope.pageList.push '...'
            scope.pageList.push scope.conf.currentPage-i for i in [(Math.ceil(offset/2))..1]
            scope.pageList.push scope.conf.currentPage
            scope.pageList.push scope.conf.currentPage+i for i in [1..(offset/2)]
            scope.pageList.push '...'
            scope.pageList.push scope.conf.numberOfPages
        # prevent two request issue
        if scope.conf.onChange
          if !(oldValue!=newValue&&oldValue[0]==0)
            scope.conf.onChange()

        scope.$parent.conf = scope.conf
      scope.prevPage = () ->
        if scope.conf.currentPage>1
          scope.conf.currentPage -=1
      scope.nextPage = () ->
        if scope.conf.currentPage<scope.conf.numberOfPages
          scope.conf.currentPage +=1

      scope.jumpToPage = () ->
        scope.jumpPageNum = scope.jumpPageNum.replace /[^0-9]/g,''
        if scope.jumpPageNum != ''
          scope.conf.currentPage = scope.jumpPageNum

      watchExp= () ->
        if !scope.conf.totalItems
          scope.conf.totalItems=0
        newValue = scope.conf.totalItems+' '+scope.conf.currentPage+' '+scope.conf.itemsPerPage
      
      scope.$watch watchExp,getPagination
}
