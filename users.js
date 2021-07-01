const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/olxapp');

const plm = require('passport-local-mongoose');

const userSchema = mongoose.Schema({
  name : String,
  email : String,
  username : String,
  password : String,
  cars: [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'car'
  }],
  profileImage :{
    type : String,
    default : '../images/uploads/def.jpg'
  } 
})

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);