var mongoose = require('mongoose')
// Category schema

var CategorySchema = mongoose.Schema({
    title:{
        type: String,
        require:true
    },

    slug:{
        type: String,
    },

    content:{
        type: String,
        require:true
    },

    sorting:{
        type: Number,
    }
});

var Category = module.exports = mongoose.model('Category',CategorySchema);