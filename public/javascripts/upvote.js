$('document').ready(function(){
  $('.upvote').click(function(event){
    var that = this
    var upvoteID = $(this).data()
    $.ajax({
      method: 'POST',
      url : '/upvote',
      data: upvoteID
    }).then(function(){
      var score = $(that).next()
      var currentScore = score.text()
      currentScore = Number(currentScore)
      currentScore ++
      score.text(currentScore)
    })
  })
  $('.downvote').click(function(event){
    var that = this
    var downvoteID = $(this).data()
    $.ajax({
      method: 'POST',
      url : '/downvote',
      data: downvoteID
    }).then(function(){
      var score = $(that).prev()
      var currentScore = score.text()
      currentScore = Number(currentScore)
      currentScore --
      score.text(currentScore)
    })

  })

})