var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
<<<<<<< HEAD
var passport = require('passport');
=======


>>>>>>> 92f27412605fe953faa731fdeeb93fd817e54ee4

mongoose.connect(config.database);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Conected to Mongodb!");
});

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));
// Set global errors 
app.locals.errors = null;

// Express fileUpload middleware
app.use(fileUpload());

<<<<<<< HEAD
// Get page model
var Page = require('./models/page')

//Get all page to pass to header.ejs
Page.find({}).sort({
    sorting: 1
}).exec(function (err, pages) {
    if(err){
        console.log(err);
    } else{
        app.locals.pages = pages;
    }
});

// Get category model
var Category = require('./models/category');

// Get all category to pass to header.ejs
Category.find(function (err, categories) {
    if(err){
        console.log(err);
    } else{
        app.locals.categories = categories;
    }
});



=======
// Body parser
>>>>>>> 92f27412605fe953faa731fdeeb93fd817e54ee4

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

// Express session middleware

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    //cookie: { secure: true }
}))


// Express-validator

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
<<<<<<< HEAD
        isImage: function (value, filename) {
=======
        isImage: function(value, filename){
>>>>>>> 92f27412605fe953faa731fdeeb93fd817e54ee4
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.png':
                    return '.png';
                case '.jpeg':
                    return '.jpeg';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));
// Express Messages middleware
var flash = require('connect-flash')
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());




app.get('*',function(req, res, next){
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});




app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', function (req, res) {
//     res.render('index', {
//         title: 'Home'
//     });
// });
// Set routes
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var users = require('./routes/users.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/products', products);
app.use('/users', users);
app.use('/cart', cart);
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
<<<<<<< HEAD
app.use('/', pages);
=======
>>>>>>> 92f27412605fe953faa731fdeeb93fd817e54ee4




var port = 3000;
app.listen(port, function () {
    console.log('Sever started on port ' + port);
});