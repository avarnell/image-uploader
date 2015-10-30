var db = require('monk')('localhost/imgr');
var photoCollection = db.get('photos')
var Users = db.get('users')
var Comment = db.get('comments')
var Tags = db.get('tags')
var photoTags = db.get('photoTags')

var dbroutes = {
  getUserProfile : function(user1){
    return photoCollection.find({user: user1})
  },
  getIndex : function(){
    return photoCollection.find({},{limit: 12})
  },
  photoCollectionInsert : function(){
    return photoCollection.insert({})
  },
  getTags : function(){
    return Tags.find({})
  },
  getTaggedImages : function(tag){
    return photoTags.find({})
  }





}

module.exports = dbroutes