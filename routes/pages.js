const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../database/user');
const db = require('../database/db');

const user = new User();
let loggeduser = "";

router.get('/', (req, res) => {
    let user = req.session.user;
    if (user) {
        res.redirect('/home');
        return;
    }
    res.render('index');

});
router.get('/home', (req, res, next) => {
    let user = req.session.user;

    if (user) {
        // Sent to home to display name 
        if (loggeduser.username=='admin'){
            res.redirect('/admin');
        }
        res.render('user/home', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
    }
    res.redirect('/');
});
router.get('/admin', (req, res, next)=>{
    let user = req.session.user;
    if(user){
        if(loggeduser.username == 'admin'){
                res.render('user-admin/admin-home', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        }else{
            res.redirect('/unauthorized');
        }
        return;
    }
    res.redirect('/');
});
router.get('/admin/dashboard', (req, res, next)=>{
    let user = req.session.user;
    if(user){
        if(loggeduser.username == 'admin'){
                res.render('user-admin/dashboard');
        }else{
            res.redirect('/unauthorized');
        }
        return;
    }
    res.redirect('/');
});
router.get('/admin/users', (req, res, next)=>{
    let user = req.session.user;
    if(user){
        if(loggeduser.username == 'admin'){
            let sqluser = 'SELECT * FROM lucky_users';
            db.query(sqluser, (err, userdata,  fields)=>{
                if (err) throw err;
                res.render('user-admin/users-table', {userData: userdata});
            });
        }else{
            res.redirect('/unauthorized');
        }
        return;
    }
    res.redirect('/');
});
router.get('/admin/citas', (req, res, next)=>{
    let user = req.session.user;
    if(user){
        if(loggeduser.username == 'admin'){
            let sqlcita = 'SELECT * FROM lucky_citas';
            db.query(sqlcita, (err, citadata,  fields)=>{
                if (err) throw err;
                res.render('user-admin/citas-table', {citaData: citadata});
            });
        }else{
            res.redirect('/unauthorized');
        }
        return;
    }
    res.redirect('/');
});
// --------- START OF LOGIN SYSTEM ----
router.get('/signup', (req, res) => {
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
    if (userInput.username != 'admin'){
     user.create(userInput, function (lastId) {
        if (lastId) {
            user.find(lastId, function (result) {
                req.session.user = result;
                req.session.opp = 0;
                res.render('login');

            });

        } else {
            console.log('Error creating a new user ...');
            res.redirect('/');
        }
        return;
    });
}else{
    res.redirect('signup');
}
});

router.get('/login', (req, res) => {
    let user = req.session.user;

    if (user) {
        res.render('user/home', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
        
    }
    res.render('login');
});
// POST LOGIN DATA

router.post('/login', (req, res, next) => {
    user.login(req.body.username, req.body.password, function (result) {
        if (result) {
            req.session.user = result;
            req.session.opp = 1;
            loggeduser = (result);
            res.redirect('/home');
        } else {
            res.send('User Not found or Credentials Incorrect.');
            
        }
    })

});

router.get('/logout', (req, res, next) => {
    if (req.session.user) {
        req.session.destroy(function () {
            res.send('Logged Out. Redirect Home <a href="/">Here.</a>');
        });
    }
});

// --------- END OF LOGIN SYSTEM -----
// --------- START OF SECONDARY PAGES -------
// --------- START CONTACT US -------------
router.get('/contact-us', (req, res) => {
    let user = req.session.user;

    if (user) {
        res.render('user/contact-us-user', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
    }
    res.render('contact-us');
});
router.post('/send', (req, res) => {
    const { name, email, subject, message } = req.body;

    contentHTML = `
    <h1>User Information:</h1>
    <ul>
        <li>User Name: ${name}</li>
        <li>User Email: ${email}</li>
    </ul>
    <p>${message}</p>
    `;
    // Generate SMTP service account from ethereal.email
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Failed to create a testing account. ' + err.message);
            return process.exit(1);
        }

        console.log('Credentials obtained, sending message...');

        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: 'curtis.quigley58@ethereal.email',
                pass: 'MjxqRws37V7hEGxPvA'
            }
        });

        // Message object
        let message = {
            from: 'Sender Name: ' + `${req.body.email}`,
            to: 'Recipient: CitasLucky7Tatto@Lucky.com',
            subject: `${req.body.subject}`,
            //text: 'Hello to myself!',
            html: contentHTML
        };

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }

            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            res.redirect('/contact-us');
        });
    });
});
//--------- END CONTACT US -------------
router.get('/faq', (req, res) => {
    let user = req.session.user;

    if (user) {
        res.render('user/faq-user', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
    }
    res.render('faq');
});
// --------- END OF SECONDARY PAGES -------
// ---------- START OF PAYMENT PAGES ---------
router.get('/catalog-page', (req, res) => {
    let user = req.session.user;

    if (user) {
        res.render('user/catalog-page-user', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
    }
    res.render('catalog-page');
});
router.get('/product-page-cuidado-tats', (req, res) => {
    let user = req.session.user;

    if (user) {
        res.render('user/product-page-cuidado-tats-user', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
    }
    res.render('product-page-cuidado-tats');
});
router.get('/product-page-targeta', (req, res) => {
    let user = req.session.user;

    if (user) {
        res.render('user/product-page-targeta-user', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
    }
    res.render('product-page-targeta');
});
//----- por quitar shopping cart y payment page 
router.get('/shopping-cart', (req, res) => {
    res.render('shopping-cart');
});
router.get('/payment-page', (req, res) => {
    res.render('payment-page');
});
// --------- END OF PAYMENT PAGES ----------
// --------- START OF GALLERY PAGES ----------
router.get('/gallery', (req, res) => {
    let user = req.session.user;

    if (user) {
        res.render('user/gallery-user', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
    }
    res.render('gallery');
});
router.get('/gallery_Daniel', (req, res) => {
    let user = req.session.user;

    if (user) {
        res.render('user/gallery-Daniel-user', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
    }
    res.render('gallery_Daniel');
});
router.get('/gallery_Marianna', (req, res) => {
    let user = req.session.user;

    if (user) { 
        res.render('user/gallery-Marianna-user', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
    }
    res.render('gallery_Marianna');
});
router.get('/gallery_Brigitte', (req, res) => {
    let user = req.session.user;

    if (user) {
        res.render('user/gallery-Brigitte-user', { opp: req.session.opp, name: loggeduser.name , middlename: loggeduser.middlename });
        return;
    }
    res.render('gallery_Brigitte');
});
// --------- END GALLERY PAGES -----------
router.get('/unauthorized', (req, res)=>{
    res.render('not-allowed');
});

module.exports = router;