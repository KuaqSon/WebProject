var express = require('express');
var router = express.Router();


// Get Page model
var Page = require('../models/page');

/*
 * GET /
 */
router.get('/', function (req, res) {

    Page.find(function (err, page) {
        if (err)
            console.log(err);

        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
        // res.send(page);

    });

});

/*
 * GET a page
 */
router.get('/:slug', function (req, res) {

    var slug = req.params.slug;

    Page.findOne({
        slug: slug
    }, function (err, page) {
        if (err)
            console.log(err);

        if (!page) {
            res.redirect('/');
        } else {
            res.render('index2', {
                title: page.title,
                content: page.content
            });
        }
    });


});






module.exports = router;