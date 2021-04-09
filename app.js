const express = require('express');
const app = express();


app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

const bcrypt = require('bcryptjs');

const session = require('express-session');
app.use(session({
    secret: 'LuckyTattoo',
    resave: true,
    saveUninitialized: true
}));

const connection = require('./database/db');

app.get('/register', (req, res)=> {
    res.render('register');
})
app.get('/login', (req, res)=> {
    res.render('login');
})
app.get('/gallery', (req, res)=>{
    res.render('gallery');
})
app.get('/about-us', (req, res)=>{
    res.render('about-us');
})
app.get('/features', (req, res)=>{
    res.render('features');
})
app.get('/contact-us', (req, res)=>{
    res.render('contact-us');
})
app.get('/catalog-page', (req, res)=> {
    res.render('catalog-page');
})
app.get('/payment-page', (req, res)=> {
    res.render('payment-page');
})
app.get('/product-page', (req, res)=> {
    res.render('product-page');
})
app.get('/shopping-cart', (req, res)=> {
    res.render('shopping-cart');
})



app.post('/register', async (req,res) =>{
	const email = req.body.email;
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO usuarios SET ?',{email:email, user:user, name:name, rol:rol, pass:passwordHash}, async (error, results)=>{
        if(error){
			console.log(error);
			res.status(400).json({ errors });
			return;
        }else{            
			res.render('register', {
				alert: true,
				alertTitle: "Registration",
				alertMessage: "¡Successful Registration!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: 'register'
			});
            res.redirect('/');         
        }
	});
})

app.post('/auth', async (req, res)=> {
	const user = req.body.user;
	const pass = req.body.pass;    
    let passwordHash = await bcrypt.hash(pass, 8);
	if (user && pass) {
		connection.query('SELECT * FROM usuarios WHERE user = ?', [user], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcrypt.compare(pass, results[0].pass)) ) {    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });
				
				
                res.send('Incorrect Username and/or Password!');				
			} else {         
				      
				req.session.loggedin = true;                
				req.session.name = results[0].name;
				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        			
			}			
			res.end();
		});
	} else {	
		res.send('Please enter user and Password!');
		res.end();
	}
});

app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
});

app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') 
	})
});

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
})