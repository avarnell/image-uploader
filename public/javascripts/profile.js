$('document').ready(function(){

  $('#myTabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

  $('#myTabs a[href="#comments"]').tab('show')
  $('#myTabs a[href="#images"]').tab('show')

})