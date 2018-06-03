var express = require('express');
var router = express.Router();

router.get('/',function(req, res){
    res.render('index',{
        title:'Home'
    });
});

/*
 * post reoder 
 */
router.get('/reorder-pages', function(req, res){
    Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
        res.render('admin/pages', {
            pages: pages
        });
    });
});


module.exports = router;