var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require(body-parser);
var session = require('express-session');
var expressValidator = require('express-validator');



mongoose.connect(config.database);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Conected to Mongodb!");
});

var app = express();

app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');

// Body parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Express session middleware

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))


  // Express-validator

  app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
  
        while(namespace.length) {
            formParam += '[' + namespace.shift()
        }
        return{
            param: formParam,
            msg: msg,
            value: value
        };
    }
  }));
// Express-messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Set public footer



app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.render('index',{
        title:'Home'
    });
});
// Set routes
var pages = require('./routes/pages.js');
var adminPages = require('./routes/admin_pages.js');

app.use('/', pages);
app.use('/admin/pages', adminPages);


var port = 3000;
app.listen(port,function(){
    console.log('Sever started on port '+ port);
});