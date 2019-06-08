
const path = require('path');
const http = require('http');
//const { APP_PORT, APP_IP, APP_PATH } = process.env;
APP_PORT = 8080,
    APP_IP = "borolis.party",
    APP_PATH = path;

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const multer  = require('multer')
let upload = multer({ dest: 'uploads/' })


server.listen(APP_PORT, APP_IP, () => {
    console.log(`Server running at http://${APP_IP}:${APP_PORT}/`);
});


const db = require('./database.js');
const passport = require('./auth.js');

const session = require('express-session');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');

const pgSession = require('connect-pg-simple')(session);
let dbFunctions = require('./DBFunctions.js')

app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    store: new pgSession({
        pool: db,
    }),
    secret: 'akL3gm35ioTl4kdsga2',
    resave: false,
    saveUninitialized: true,
    cookie: { }
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'dist')));
app.use(favicon(path.join(__dirname, 'dist', 'images/favicon.png')));

app.set('views', './views');
app.set('view engine', 'ejs');


app.get('/', async (req, res) => {
    if (req.user === undefined){
        res.redirect('/login')
    } else {
        res.render("index.ejs", {
            username:req.user.username,
        })

    }
});


app.post('/', async (req, res) => {

    let json = {
        "form":"kek",
    }

    res.status(200);
    res.send(json);
});


app.post('/api/v1', apiHandler);


async function apiHandler(req, res) {
    let jsonResponse = {}

    jsonResponse.status = 'OK'
    jsonResponse.status_description = 'All is ok'

    if (req.user === undefined) {
        jsonResponse.status = 'ERROR'
        jsonResponse.status_description = 'You have not logged in'
        res.send(jsonResponse)
        return;
    }

    if (req.body.query === undefined || req.body.query === null) {
        jsonResponse.status = 'ERROR'
        jsonResponse.status_description = 'Query is undefined'
        res.send(jsonResponse)
        return;
    }

    switch (req.body.query) {
        case 'getMyPresentations': {
            jsonResponse.result = await getMyPresentations(req)
            ///TODO get list of presentations
            break;
        }

        case 'getPresentation': {
            ///TODO get one presentation by ID
            break;
        }

        case 'getSlidesForPresentation': {
            ///TODO get list of slides by presentationID
            break;
        }

        case 'getSlide': {
            ///TODO get one slide by slideID
            break;
        }

        case 'newSlide': {
            ///TODO create new slide with content and return it's ID
            break;
        }

        case 'updateSlide': {
            ///TODO update one slide by slideID
            break;
        }


        default:
            jsonResponse.status = 'ERROR'
            jsonResponse.status_description = 'This query is unsupported'
            break;
    }


    res.send(jsonResponse)
}

app.get('/slide', async(req, res)=> {
    res.status(200)
    res.render("slide.ejs", {
        username:req.user.username,
    })
})

app.get('/login', (req, res) => {
    if (req.user === undefined){
        res.render('login');
    } else {
        res.redirect('/');
    }
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/'
}));

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});


app.post('/uploadImage', async (req, res) => {

    console.log(req);
    res.status(200);
    let jsonQuery = req.body
    let base64image = jsonQuery.base64

    let response =
        {
            message : "all is ok, i've got message",
            base64image : base64image
        }
    res.send(response);
    //res.send(json);
})

app.post('/downloadImage', async (req, res) => {

    console.log(req);
    res.status(200);

    let jsonQuery = req.body
    if(jsonQuery === null)
    {
        res.status(404);
        return;
    }
    

    res.send(response);
    //res.send(json);
})


app.get('/kek',  passport.authenticate('session'), (req, res) =>{
    console.log(req.user)
    console.log('It Works')
    res.send("OK")
});

app.post('/newRequest', async (req, res) => {

    console.log(req.body);
    res.status(200);
    res.send("OK");
    //res.send(json);
})


async function getMyPresentations(req) {
    let presentations ={}
    presentations.presentations = await dbFunctions.getMyPresentations(req.user);
    return presentations
}