var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

/*
 * GET user index
 */
router.get('/', isAdmin, function (req, res) {
    res.render('admin/users', {
        users: users
    });
});

/*
 * GET add user
 */
router.get('/add-user', isAdmin, function (req, res) {
    var name = "";
    var username = "";
    var password = "";
    var admin = "";

    res.render('admin/addUser', {
        name: name,
        username: username,
        admin: admin,
        password: password
    });
})



/*
 * POST add user
 */
router.post('/add-user', function (req, res) {

    req.checkBody('name', 'Name must have a value ! ').notEmpty();
    req.checkBody('username', 'Username must have a value ! ').notEmpty();
    req.checkBody('password', 'password must have a value ! ').notEmpty();

    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/addUser', {
            name: name,
            username: username,
            password: password
        });
    } else {
        User.findOne({
            username: username
        }, function (err, user) {
            if (user) {
                req.flash('danger', 'User username exists, chose another!');
                res.render('admin/addUser', {
                    name: name,
                    username: username,
                    password: password
                });
            } else {
                var user = new User({
                    name: name,
                    username: username,
                    password: password,
                    admin : 0
                });
                user.save(function (err) {
                    if (err)
                        return console.log(err);
                   
                    req.flash('success', 'User added!');
                    res.redirect('/admin/users');
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
                password: user.password,
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
    req.checkBody('password', 'password must have a value ! ').notEmpty();

    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var id = req.params.id;
    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/editUser', {
            errors: errors,
            name: name,
            username: username,
            password: password,
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
            password: password,
            id: id
                });
            } else {
                User.findById(id, function (err, user) {
                    if (err)
                        return console.log(err);
                    user.name = name;
                    user.username = username;
                    user.password = password;

                    user.save(function (err) {
                        if (err)
                            return console.log(err);
                      
                        req.flash('success', 'User edited!');
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