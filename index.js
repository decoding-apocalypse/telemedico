require('dotenv').config();
// can add {path: "path of the dotenv file"} but default it looks for .env

const   express         = require('express'),
        app             = express(),
        ejsMate         = require('ejs-mate'),
        path            = require('path'),
        PUBLISHABLE_KEY = process.env.PUBLISHABLE_KEY,
        SECRET_KEY      = process.env.SECRET_KEY,
        stripe          = require('stripe')(SECRET_KEY),
        server          = require('http').createServer(app),
        io              = require('socket.io')(server),
        PORT            = process.env.PORT || 3000;


// ==================== CHAT SECTION =======================

io.on('connection', socket => {
    socket.on('send-message', (data) => {
        socket.broadcast.emit('recieve-message', data);
    })
})

// =========================================================

app.set("view engine","ejs")

// require('./db/conn');
// const   Register    = require('./models/signup');

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/doctors', (req, res) => {
    res.render('doctor');
});

app.get('/doctors/:doctorID', (req, res) => {
    res.render('profile');
});

app.get('/doctors/:doctorID/appointment', (req, res) => {
    res.render('appointment');
});

app.get('/doctors/:doctorID/appointment/payment',(req,res)=>
{
   res.render('payment',{
       key: PUBLISHABLE_KEY
   })
})

 app.post('/doctors/:doctorID/appointment/payment',(req,res)=>{
   stripe.customers.create({
       email:req.body.stripeEmail,
       source:req.body.stripeToken,
       name:'TeleMedico',
       address:{
           line1: 'Kiron Housing complex, Adabari Tiniali',
           postal_code : '781012',
           city: 'Guwahati',
           state : 'Assam',
           country: 'India'
       }
    
   })
   .then((customer)=>{
       return stripe.charges.create({
           amount:39900,
           description: 'Consultation Charges',
           currency: 'INR',
           customer:customer.id
       })
   })
   .then((charge)=>{
       console.log(charge)
       res.redirect("/")
       
   })
   .catch((err)=>{
       res.send(err)
   })
})

app.get('/doctors/:doctorID/chat', (req,res)=>{
    res.render('chat');
})

app.get('/specialities', (req, res) => {
    res.render('specialities');
});

app.get('/specialities/:specialitiesName', (req, res) => {
    res.render('speciality');
});

app.get('/login', (req, res)=> {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if(password === cpassword) {
            const registerEmployee = new Register({
                username: req.body.username,
                email: req.body.email,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword
            });

            const registered = await registerEmployee.save();
            res.status(201).render('login');
        }
        else {
            res.send(`password didn't match`);
        }
        // console.log(req.body.username);
        // res.send(req.body.username);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

app.get('/payment',(req,res)=>
{
   res.render('payment',{
       key: PUBLISHABLE_KEY
   })
})

 app.post('/payment',(req,res)=>{
   stripe.customers.create({
       email:req.body.stripeEmail,
       source:req.body.stripeToken,
       name:'TeleMedico',
       address:{
           line1: 'Kiron Housing complex, Adabari Tiniali',
           postal_code : '781012',
           city: 'Guwahati',
           state : 'Assam',
           country: 'India'
       }
    
   })
   .then((customer)=>{
       return stripe.charges.create({
           amount:39900,
           description: 'Consultation Charges',
           currency: 'INR',
           customer:customer.id
       })
   })
   .then((charge)=>{
       console.log(charge)
       res.redirect("/")
       
   })
   .catch((err)=>{
       res.send(err)
   })
})


app.get('*', (req,res) => {
    res.render('error');
});

server.listen(PORT, () => {
    console.log(`THE SERVER IS RUNNING ON PORT ${PORT}`);
});