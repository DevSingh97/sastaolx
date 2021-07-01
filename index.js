const express = require('express');
const router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
const e = require('express');
const multer = require('multer');
const carModel = require('./carSchema');


passport.use(new localStrategy(userModel.authenticate()));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    var randomNumber = Math.floor(Math.random() * 10000000);
    randomNumber = randomNumber + Date.now();
    var uniqueName = randomNumber + file.originalname; 
    cb(null, uniqueName);
  }
})
 
var upload = multer({ storage: storage, fileFilter : filterfunc })

function filterfunc(req, file, cb){
  if(file.mimetype === 'image/png' ||  file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null, true);
  } else {
    cb(null, false)
  }
}

router.get('/', function(req, res){
  res.render('index');
});

router.post('/reg', function(req, res){
  var data = new userModel({
    name : req.body.name,
    email : req.body.email,
    username : req.body.username
  })

  userModel.register(data, req.body.password)
    .then(function(userRegistered){
      passport.authenticate('local')(req, res, function(){
        res.redirect('/')
      })
    })
})

router.post('/login', passport.authenticate('local',{
  successRedirect : '/profile',
  failureRedirect : '/'
}) ,function(req, res){})

router.get('/logout', function(req, res){
  req.logOut();
  res.redirect('/');
})

router.get('/profile', isLoggedIn,function(req, res){
  userModel.findOne({username : req.user.username})
    .populate('cars')
    .exec(function(err, foundUser){
      res.render('profile', {foundUser})
    })
})

router.post('/uploadimage', upload.single('image') , function(req, res){
  userModel.findOne({username: req.session.passport.user})
    .then(function(foundUser){
      foundUser.profileImage = `./images/uploads/${req.file.filename}`;
      foundUser.save()
        .then(function(){
          res.redirect('profile');
        })
    })
})

router.post('/addcar', isLoggedIn, upload.single('carimg') ,function(req, res){
  userModel.findOne({username : req.session.passport.user})
    .then(function(loggedinUser){
      
      var carImgAddress = `../images/uploads/${req.file.filename}`;
      
      carModel.create({
        sellerId : loggedinUser._id,
        carname : req.body.carsname,
        carprice : req.body.carsprice,
        contact : req.body.contact,
        carimg : carImgAddress 
      }) 
      
      .then(function(createdCar){
        loggedinUser.cars.push(createdCar);
        loggedinUser.save()
        .then(function(u){
          res.redirect('/profile')
        })
      })
    })
})

router.get('/sell/:page', function(req, res){
  var perPage = 2;
  var page = Math.max(0, req.params.page);

  carModel.find()
      .limit(perPage)
      .skip(perPage * page)
      .exec(function(err, cars) {
          carModel.count().exec(function(err, count) {
              res.render('sell', {
                cars : cars,
                page: page,
                pages: count / perPage,
                isLoggedIn : true
              })
          })
      })
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } 

  else {
    return res.redirect('/')
  }
}

module.exports = router;
