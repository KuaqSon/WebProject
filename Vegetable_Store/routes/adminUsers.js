var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
var bcrypt = require('bcryptjs');
var passport = require('passport');

passport.serializeUser((user,done)=>{
    done(null,user.ID);
})

passport.deserializeUser((id,done)=>{
    User.findById(id).then((user)=>{
        done(null,user);
    })
})



/*
 * GET user index
 */
router.get('/', function (req, res) {

    User.find(function (err, users) {
        res.render('admin/users', {
            users: users,
        });
    });
});



/*
 * GET add user
 */
router.get('/add-user', isAdmin, function (req, res) {
    var name = "";
    var username = "";
    var password = "";

    res.render('admin/addUser', {
        name: name,
        username: username,
        password: password
    });
})



/*
 * POST add user
 */
router.post('/add-user', function (req, res) {

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
        res.render('admin/addUser', {
            errors: errors,
            user: null,
            title: 'Add User'
        });
    } else {
        User.findOne({username: username}, function (err, user) {
            if (err)
                console.log(err);

            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('admin/addUser');
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
                                req.flash('success', 'Add user success!');
                                res.redirect('/admin/users');
                            }
                        });
                    });
                });
            }
        });
    }

});



/*
 * GET edit user
 */
router.get('/edit-user/:id', isAdmin, function (req, res) {
    User.findById(
        req.params.id,
        function (err, user) {
            if (err)
                return console.log(err);
            res.render('admin/editUser', {
                name: user.name,
                username: user.username,
                admin: user.admin,
                id: user._id
            });

        });
})


/*
 * POST edit user
 */

router.post('/edit-user/:id', function (req, res) {
    req.checkBody('name', 'Name must have a value ! ').notEmpty();
    req.checkBody('username', 'Username must have a value ! ').notEmpty();
    req.checkBody('admin', 'choose one ! ')
    var name = req.body.name;
    var username = req.body.username;
    var admin = req.body.admin;
    
    var id = req.params.id;
    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/editUser', {
            errors: errors,
            name: name,
            username: username,
            admin: admin,
            id: id
        });
    } else {
        User.findOne({
            username: username,
            _id: {
                '$ne': id
            }
        }, function (err, user) {
            if (user) {
                req.flash('danger', 'Username exists, chose another!');
                res.render('admin/editUser', {
                    name: name,
                    username: username,
                    admin: admin,
                    id: id
                });
            } else {
                User.findById(id, function (err, user) {
                    if (err)
                        return console.log(err);
                    user.name = name;
                    user.username = username;
                    user.admin = admin;

                    user.save(function (err) {
                        if (err)
                            return console.log(err);

                        req.flash('success', 'User edited!');
                        console.log(user.admin);
                        console.log(admin);
                        res.redirect('/admin/users/edit-user/' + id);
                    });
                });
            }


        });
    }
});



/*
 * GET delete user
 */
router.get('/delete-user/:id', isAdmin, function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err) {
        if (err) return console.log(err);

        req.flash('success', 'User deleted!');
        res.redirect('/admin/users/');
    });
})





module.exports = router;