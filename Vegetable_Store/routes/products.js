var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
// Get Product model
var Product = require('../models/product');
// Get Product model
var Category = require('../models/category');


/*
 * GET all products/
 */
router.get('/', function (req, res) {

    Product.find(function (err, products) {
        if (err)
            console.log(err);
        res.render('allProducts', {
            title: "All products",
            products: products
        });
        // res.send(page);

    });

});

/*
 * GET all products by category/
 */
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    Category.findOne({
        slug: categorySlug
    }, function (err, c) {
        Product.find({
            category: categorySlug
        }, function (err, products) {
            if (err)
                console.log(err);
            res.render('catProducts', {
                title: c.title,
                products: products
            });
            // res.send(page);

        });
    });



});


/*
 * GET all products detail
 */
router.get('/:category/:product', function (req, res) {

    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;
    Product.findOne({
        slug: req.params.product
    }, function (err, product) {
        if (err)
            console.log(err);
        else {
            var galleryDir = 'public/productImages/' + product._id + '/gallery';
            fs.readdir(galleryDir, function (err, files) {
                if (err)
                    console.log(err);
                else {
                    galleryImages = files;
                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn

                    });
                }
            })
        }
    });


});

router.get('/search',function(req,res){

    res.render('search',{
        title:"Tìm kiếm"
    })
})

router.post('/search',function(req,res){
    var thamso= req.body.search;        //search là name trong của search trong search.ejs
    var valueCallBack=[];
    Product.find(function(err,listProducts){
        if(err) console.log(err);
        valueCallBack = listProducts.filter(x => x.title.toUpperCase().includes(thamso.toUpperCase())==1);
        res.render('dan-sach-san-pham-tim-duoc',{valueCallBack:valueCallBack})
    })
})



module.exports = router;