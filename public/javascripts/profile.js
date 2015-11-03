$('document').ready(function(){

  $('#myTabs a[href="#images"]').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

  $('#myTabs a[href="#comments"]').click(function (e) {
    e.preventDefault()
    console.log(this)
    $(this).tab('show')
  })

  // $('#myTabs a[href="#comments"]').tab('show')
  // $('#myTabs a[href="#images"]').tab('show')

})