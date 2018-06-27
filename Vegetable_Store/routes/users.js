var express = require('express');
var router = express.Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20');
var bcrypt = require('bcryptjs');

passport.serializeUser((user,done)=>{
    done(null,user.ID);
})

passport.deserializeUser((id,done)=>{
    User.findById(id).then((user)=>{
        done(null,user);
    })
})

passport.use(
    new GoogleStrategy({
        //option for the google start
        clientID:'33554976433-0jq14i9ct8uphp7dfi0l8hhpc7d8mqks.apps.googleusercontent.com',
        clientSecret:'ol1a_iu5LH5KanPh7yEnLRYB',
        callbackURL:'http://localhost:3000/users/auth/google/redirect'
    },(accessToken, refreshToken, profile, done)=>{
        //callback google auth
        User.findOne({ID:profile.id}).then((currentUser)=>{
            if(currentUser){
                done(null,currentUser);
            }else{
                new User({
                    ID:profile.id,
                    name:profile.displayName,
                    admin:0
                }).save().then((newUser)=>{
                    done(null,newUser);
                })
            }
        })
    })
)

// Get Users model
var User = require('../models/user');

/*
 * GET register
 */
router.get('/register', function (req, res) {

    res.render('register', {
        title: 'Register'
    });

});

/*
 * POST register
 */
router.post('/register', function (req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({username: username}, function (err, user) {
            if (err)
                console.log(err);

            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err)
                            console.log(err);

                        user.password = hash;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'You are now registered!');
                                res.redirect('/users/login')
                            }
                        });
                    });
                });
            }
        });
    }

});

/*
 * GET login
 */
router.get('/login', function (req, res) {

    if (res.locals.user) res.redirect('/');
    
    res.render('login', {
        title: 'Log in'
    });

});

/*
 * POST login
 */
router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    
});

router.get('/auth/google',passport.authenticate('google',{
    scope:['profile']
}));

router.get('/auth/google/redirect',passport.authenticate('google',{
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash:true
}));

/*
 * GET logout
 */
router.get('/logout', function (req, res) {

    req.logout();
    
    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');

});

// Exports
module.exports = router;


