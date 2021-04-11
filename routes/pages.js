const express = require('express');
const router = express.Router();
const User = require('../database/user');

const user = new User();

router.get('/', (req, res)=> {
    let user = req.session.user;
    if(user){
        res.redirect('/home');
        return;
    }
    res.render('index');
    
});
router.get('/home', (req, res, next) => {
    let user = req.session.user;

    if(user) {
        res.render('home', {opp:req.session.opp, name:user.name});
        return;
    }
    res.redirect('/');
});
// --------- START OF LOGIN SYSTEM ----
router.get('/signup', (req, res)=> {
	res.render('signup');
});
// POST SIGNUP DATA
router.post('/signup', (req, res, next) => {
    let userInput = {
        name: req.body.name,
        middlename: req.body.middlename,
        phone: req.body.phone,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    };
    user.create(userInput, function(lastId) {
        if(lastId) {
            user.find(lastId, function(result) {
                req.session.user = result;
                req.session.opp = 0;
                res.redirect('/login');
            });
                res.send('Welcome '+ userInput.name)
        }else {
            console.log('Error creating a new user ...');
        }
    });

});

router.get('/login', (req, res)=> {
    res.render('login');
});
// POST LOGIN DATA
router.post('/login', (req, res)=>{
    user.login(req.body.username, req.body,password, function(result){
        if(result){
            req.session.user = result;
            req.session.opp = 1;
            res.redirect('/home');
        }else{
            res.send('Username or Password Incorrect!');
        }
    })

});

router.get('/loggout', (req, res, next) => {
    if(req.session.user) {
        req.session.destroy(function() {
            res.redirect('/');
        });
    }
});

// --------- END OF LOGIN SYSTEM -----
// --------- START OF SECONDARY PAGES -------
router.get('/about-us', (req, res)=>{
    res.render('about-us');
});
router.get('/features', (req, res)=>{
    res.render('features');
});
router.get('/contact-us', (req, res)=>{
    res.render('contact-us');
});
router.get('/gallery', (req, res)=>{
    res.render('gallery');
});
// --------- END OF SECONDARY PAGES -------
// ---------- START OF PAYMENT PAGES ---------
router.get('/catalog-page', (req, res)=> {
    res.render('catalog-page');
});
router.get('/product-page', (req, res)=> {
    res.render('product-page');
});
router.get('/shopping-cart', (req, res)=> {
    res.render('shopping-cart');
});
router.get('/payment-page', (req, res)=> {
    res.render('payment-page');
});
// --------- END OF PAYMENT PAGES ----------
router.get('/register', (req, res)=> {
	res.render('register');
});


module.exports = router;