$('document').ready(function(){
  $('.upvote').click(function(){
    var upvoteID = $(this).data()
    $.ajax({
      method: 'POST',
      url : '/upvote',
      data: upvoteID
    }).then(function(){
      var currentScore = $('#score').text()
      currentScore = Number(currentScore)
      currentScore++
      $('#score').text(currentScore)
    })
  })
  $('.downvote').click(function(){
    var downvoteID = $(this).data()
    $.ajax({
      method: 'POST',
      url : '/downvote',
      data: downvoteID
    }).then(function(){
      var currentScore = $('#score').text()
      currentScore = Number(currentScore)
      currentScore--
      $('#score').text(currentScore)
    })
  })

})