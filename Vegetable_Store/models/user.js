var mongoose = require('mongoose');

// User Schema
var UserSchema = mongoose.Schema({
   
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    admin: {
        type: Number
    },
    ID:{
        type:String,
        require:false
    } 
});

var User = module.exports = mongoose.model('User', UserSchema);

