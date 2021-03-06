var express = require('express');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var router = express.Router();
// Get product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category');

/*
 * GET product index
 */
router.get('/', isAdmin, function (req, res) {
    var count = 0;

    Product.count(function (err, c) {
        count = c;
    });
    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });



});

/*
 * GET add product
 */
router.get('/add-product', isAdmin, function (req, res) {
    var title = "";
    var desc = "";
    var price = "";
    Category.find(function (err, categories) {
        res.render('admin/addProduct', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });


})



/*
 * POST add product
 */
router.post('/add-product', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";


    req.checkBody('title', 'Title must have a value ! ').notEmpty();
    req.checkBody('desc', 'Description must have a value ! ').notEmpty();
    req.checkBody('price', 'Price must have a value ! ').isDecimal();
    req.checkBody('image', 'You much upload an image! ').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/addProduct', {
                errors: errors,
                title: title,
                desc: desc,
                price: price,
                categories: categories
            });
        });
    } else {
        Product.findOne({
            slug: slug
        }, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, chose another!');
                Category.find(function (err, categories) {
                    res.render('admin/addProduct', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });
                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/productImages/' + product._id, function (err) {
                        return console.log(err);
                    });
                    mkdirp('public/productImages/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });
                    mkdirp('public/productImages/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    })

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/productImages/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }
                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }


});

/*
 * GET edit product
 */
router.get('/edit-product/:id', isAdmin, function (req, res) {

    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Category.find(function (err, categories) {
        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/productImages/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    } else {
                        galleryImages = files;
                        res.render('admin/editProduct', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id

                        });
                    }
                });
            }
        });

    });

})


/*
 * POST edit product
 */

router.post('/edit-product/:id', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";


    req.checkBody('title', 'Title must have a value ! ').notEmpty();
    req.checkBody('desc', 'Description must have a value ! ').notEmpty();
    req.checkBody('price', 'Price must have a value ! ').isDecimal();
    req.checkBody('image', 'You much upload an image! ').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({
            slug: slug,
            _id: {
                '$ne': id
            }
        }, function (err, p) {
            if (err) console.log(err);
            if (p) {
                req.flash('danger', 'Product title exists, chose another!');
                res.redirect('/admin/products/edit-product/' + _id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;

                    if (imageFile != "") {
                        p.image = imageFile;
                    }
                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/productImages/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }
                            var productImage = req.files.image;
                            var path = 'public/productImages/' + id + '/' + imageFile;
                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }
                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });

                });
            }
        });
    }

});


/*
 * POST product gallery
 */
router.post('/product-gallery/:id', function (req, res) {
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/productImages/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/productImages/' + id + '/gallery/thumbs/' + req.files.file.name;
    productImage.mv(path, function (err) {
        if (err)
            console.log(err);
        resizeImg(fs.readFileSync(path), {
            width: 100,
            height: 100
        }).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });
    res.sendStatus(200);
})


/*
 * GET delete gallery
 */
router.get('/delete-image/:image', isAdmin, function (req, res) {
    var originalImage = 'public/productImages/' + req.query.id + '/gallery/' + req.params.image;
    var thumbsImage = 'public/productImages/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbsImage, function (err) {
                if (err)
                    console.log(err);
                else {
                    req.flash('success', 'Image edited!');
                    res.redirect('/admin/products/edit-product/' + req.params.id);
                }
            });
        }
    });
})

/*
 * GET delete page
 */
router.get('/delete-product/:id', isAdmin, function (req, res) {
    var id = req.params.id;
    var path = 'public/productImages/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            req.flash('success', 'Product deleted');
            res.redirect('/admin/products');
        }
    });


})

/*
 * GET delete page
 */
router.get('/delete-page/:id', isAdmin, function (req, res) {
    Page.findByIdAndRemove(req.params.id, function (err) {
        if (err) return console.log(err);
        req.flash('success', 'Page deleted!');
        res.redirect('/admin/pages/');
    });
})





module.exports = router;