var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var db = require('monk')('localhost/imgr');

var photoCollection = db.get('photos')
var Users = db.get('users')
var Comment = db.get('comments')
var Tags = db.get('tags')
var photoTags = db.get('photoTags')

var multer  = require('multer');
var upload = multer().single('file');
var fs = require('fs')
var dbroutes = require('../lib/routes.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  dbroutes.getIndex().then(function(data){
    res.render('index', { title: 'imgr' , 
      user : req.session.username,
      photos : data
    });
  })  
});

router.get('/register', function(req,res,next){
  res.render('user/register')
})

router.post('/register', function(req,res,next){
  var errors = []
  if(!req.body.username || !req.body.password || !req.body.retype){
    errors.push('All fields are required.')
  }
  if(req.body.password !== req.body.retype){
    errors.push('Passwords do not match.')
  }
  if(errors.length) res.render('user/register', {errors : errors})
  else{
    Users.find({username : req.body.username}, function(error,data){
      if(data.length){
        errors.push('Sorry, that user already exists.')
        res.render('user/register', {errors : errors})
      }
      else{
        var hash = bcrypt.hashSync(req.body.password, 8)
        Users.insert({username: 
          req.body.username,
          passhash : hash,
          profilePic : '/images/emptyProf.png'
       }, function(){
          res.redirect('/login')
        })
      }
    })
  }
})

router.get('/login', function(req,res,next){
  res.render('user/login')
})

router.post('/login', function(req,res,next){
  var errors = []
  if(!req.body.username || !req.body.password){
    errors.push('All fields are required.')
    res.render('user/login', {errors:errors})
  }else{
    Users.findOne({username : req.body.username}).then(function(data){
      if(!data){
        errors.push('User does not exist. Please register.')
        res.render('user/login', {errors:errors})
      } else {
        if(bcrypt.compareSync(req.body.password, data.passhash)){
          req.session.username = req.body.username
          req.session.id = data._id
          res.redirect('/')
        }
        else{
          errors.push('Incorrect Password')
          res.render('user/login', {errors:errors})
        }
      }
    })
  }
})

router.get('/upload', function(req,res,next){
  res.render('image/upload', {user : req.session.username})
})

router.post('/upload',  function(req,res,next){
  var errors = []
  upload(req,res, function(err){
    if(!req.file || !req.body.title){
      errors.push("title and file required")
      res.render('image/upload', {errors: errors})
    }
    var name;
    var tags = req.body.tags.trim().split(',')
    var file = req.file.buffer
    var fileType = req.file.originalname.split('.')[1]
    
    dbroutes.photoCollectionInsert().then(function(data){
      var name = data._id
      var viewPath = '/uploads/' + name + '.' + fileType
      photoCollection.updateById(name, {
        title : req.body.title,
        viewPath : viewPath, 
        tags : tags,
        user: req.session.username,
        description: req.body.description,
        score : 0
      }).then(function(){
        var path = './public/uploads/' + name + '.' + fileType
        fs.writeFile(path, file)
      }).then(function(){
        tags.forEach(function(tag){
          tag = tag.trim()
          Tags.find({tagName : tag}).then(function(data){
            if(!data.length){
              return Tags.insert({tagName : tag})
            }
            else{
              console.log(data)
              return data[0]
            }
          }).then(function(tagData){
            console.log(tagData._id)
            photoTags.insert({
              tagId : tagData._id,
              photoId : name
            })
          })
        })
      }).then(function(){
        res.redirect('/image/' + name)
      })
    })
  })
})

router.get('/image/tags', function(req,res,next){
  dbroutes.getTags().then(function(tags){ 
    res.render('image/allTags', {tags : tags})
  })
})

router.get('/image/tags/:tag', function(req,res,next){
  var localPhotos = []
  Tags.find({tagName : req.params.tag}).then(function(tag){
    return photoTags.find({tagId : tag[0]._id })
  }).then(function(data){
    data.forEach(function(phototag){
      var phototag = photoCollection.findOne({_id : phototag.photoId})
      localPhotos.push(phototag)
    })
    return Promise.all(localPhotos)
    }).then(function(images){
      res.render('image/tagView', {images : images,
        tag : req.params.tag, 
        user: req.session.username})
  }) 
})

router.get('/image/:id', function(req,res,next){
  var photo;
  photoCollection.findById(req.params.id).then(function(data){
    photo = data
    return Comment.find({photoID : req.params.id })
  }).then(function(comments){
    res.render('image/show', {
      user: req.session.username,
      comments : comments,
      image : photo
    })
  })
})

router.post('/image/:id', function(req,res,next){
  Comment.insert({
    user : req.session.username,
    photoID : req.params.id,
    comment : req.body.comment
  }).then(function(){
    res.redirect('/image/' + req.params.id)
  })
})

router.post('/image/:id/edit', function(req,res,next){
  photoCollection.update({_id : req.params.id},
    {$set: {
      title : req.body.title,
      description : req.body.description
    }}).then(function(response){
    res.send('updated')
  })
})

router.get('/image/:id/delete', function(req,res,next){
  photoCollection.remove({_id: req.params.id}).then(function(){
    var mongoID = new MongoId(req.paramas.id)
    photoTags.remove({photoId : mongoID}).then(function(){   
    })
  })
  res.redirect('/')
})

router.get('/user/:username', function(req,res,next){
  dbroutes.getUserProfile(req.params.username).then(function(photos){
    var photos = photos
    Users.findOne({username : req.params.username}).then(function(profile){
      var userView = req.params.username
      res.render('user/profile', {photos : photos, 
        user: req.session.username,
        userView : userView
      })
    })
  })
})

router.get('/logout', function(req,res,next){
  req.session = null
  res.redirect('/')
})

router.post('/upvote', function(req,res,next){
  photoCollection.update({_id:req.body.id},{$inc: {score: 1}})
  res.send('hit')
})

router.post('/downvote', function(req,res,next){
  photoCollection.update({_id:req.body.id},{$inc: {score: -1}})
  res.send('hit')
})


module.exports = router;