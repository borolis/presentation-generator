const crypto = require('crypto');
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

let storage = multer.diskStorage({
    destination: 'dist/upload/',
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err)
                return cb(err)
            //console.log(raw.toString('hex') + path.extname(file.originalname))
            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    }
})

let upload = multer({ storage: storage })


server.listen(APP_PORT, APP_IP, () => {
    console.log(`Server running at http://${APP_IP}:${APP_PORT}/`);
});


const db = require('./database.js');
const passport = require('./auth.js');

const session = require('express-session');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json({limit: '50mb'});
const urlencodedParser = bodyParser.urlencoded({limit: '50mb', extended: true});
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');

const pgSession = require('connect-pg-simple')(session);
let dbFunctions = require('./DBFunctions.js')


app.use(cookieParser());
app.use(bodyParser({limit: '50mb'}));
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


app.post('/new', upload.single('background'), async function (req, res, next) {
    let user = req.user
    if(user === undefined)
    {
        return;
    }

    let presentationName = req.body.presentationName
    let countOfSlides = req.body.countOfSlides
    let backGroundFilename = req.file.filename


    console.log('New request: addition')
    console.log('back:' + backGroundFilename)
    console.log('name:' + presentationName)
    console.log('slides:' + countOfSlides)
    console.log(' ')

    let path = 'upload/' + backGroundFilename

    let imageId = await dbFunctions.newImage(user, path, 'kek')



    let insertedPresentationId = await dbFunctions.newPresentation(user, presentationName, countOfSlides, imageId)

    let slidesId = []
    //make slides for presentation
    for(let i = 0; i < req.body.countOfSlides; i++) {
        slidesId.push(await dbFunctions.addNewSlide(user, insertedPresentationId))
    }
    console.log('slidesID:')
    console.log(slidesId)

    let updatedRow = await dbFunctions.updatePresentation(user, insertedPresentationId, presentationName, countOfSlides, imageId, slidesId)

    console.log('updatedRow:' + updatedRow)

    res.redirect('/')

})

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
            jsonResponse.result = {}
            jsonResponse.result.presentations = await getMyPresentations(req)
            break;
        }

        case 'getPresentation': {
            console.log('get presentation')
            jsonResponse.result = {}
            jsonResponse.result.presentation = await getPresentation(req)

            break;
        }

        case 'deletePresentation': {
            console.log('delete presentation')
            jsonResponse.result = {}
            jsonResponse.result.presentation = await deletePresentation(req)

            break;
        }

        case 'getSlidesForPresentation': {
            jsonResponse.result = {}
            jsonResponse.result.slides = await getSlidesForPresentation(req)
            //jsonResponse.req = req.body
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
            jsonResponse.result = {}
            jsonResponse.result.request = req.body
            jsonResponse.result.updatedId = await updateSlide(req)
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

app.get('/slider', async(req, res)=> {
    res.status(200)
    res.render("slider.ejs", {
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

app.get('/new',  passport.authenticate('session'), (req, res) =>{
    res.render('newPresentation.ejs')

});

app.post('/newRequest', async (req, res) => {

    console.log(req.body);
    res.status(200);
    res.send("OK");
    //res.send(json);
})


async function getMyPresentations(req) {
    let presentations ={}
    return await dbFunctions.getMyPresentations(req.user);

}

async function getPresentation(req)
{
    let presentationId = req.body.data.presentationId
    let user = req.user

    //console.log('presentationId')
    //console.log(presentationId)
    //console.log('user')
    //console.log(user)

    let presentation ={}
    presentation = await dbFunctions.getPresentationById(presentationId, user);
    return presentation
}


async function deletePresentation(req)
{
    let presentationId = req.body.data.presentationId
    let user = req.user

    //console.log('presentationId')
    //console.log(presentationId)
    //console.log('user')
    //console.log(user)
    let isSlidesDeleted = dbFunctions.deleteSlidesByPresentationId(presentationId, user)
    let presentation = {}

    if(isSlidesDeleted) {
        presentation = await dbFunctions.deletePresentationById(presentationId, user);
    }
    return presentation
}

async function updateSlide(req)
{
    //let presentationId = req.body.data.presentationId
    let user = req.user
    let slide = req.body.data.slide

    //console.log('presentationId')
    //console.log(presentationId)
    //console.log('user')
    //console.log(user)

    return await dbFunctions.updateSlide(slide, user);
}


async function getSlidesForPresentation(req)
{
    let presentationId = req.body.data.presentationId
    let user = req.user

    //console.log('presentationId')
    //console.log(presentationId)
    //console.log('user')
    //console.log(user)

    let slides = []
    slides = await dbFunctions.getSlidesForPresentation(presentationId, user);
    return slides
}