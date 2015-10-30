$('document').ready(function(){

  $('.edit').click(function(event){
    var title = $('#title').text()
    $('#title').replaceWith('<h1><input type="text" id="newTitle" value="'+title+'"> </input> </h1>')
    var description = $('#description').text()
    $('#description').replaceWith('<input type="text" id="newDescription" value="'+description+'"> </input>')
    $('.btn-warning').text('Save?').parent().addClass('save').removeClass('edit')

    $('.save').click(function(){
    
      var id = $('.delete').data('id')
      var newTitle = $('#newTitle').val()
      var newDescription = $('#newDescription').val()

      $.ajax({
        url : '/image/' + id + '/edit',
        method: 'post',
        data : {
          imageId : id,
          title : newTitle,
          description : newDescription
        }
      }).then(function(response){
        $('#newTitle').replaceWith('<h1 id="title">'+ newTitle +'</h1>')
        $('#newDescription').replaceWith('<span id="description">'+ newDescription +'</span>')
        $('.btn-warning').text('Edit?')
        $(this).addClass('edit')

      })

    })

  })

  

})