const express = require('express');
const mustacheExpress = require('mustache-express');
const mustache = require('mustache');
const bodyParser = require('body-parser');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

var application = express();


application.engine('mustache', mustacheExpress());

application.set('views', './views');
application.set('view engine', 'mustache');

application.use(express.static('public'));

application.use(cookieParser());
application.use(bodyParser.urlencoded( {extended: false} ));

application.use(expressSession({
    secret: 'this is cool',
    resave: false,
    saveUnintialized: true,
    cookie: { }
}));

var model = {};

var storage = {
    users: [],
    sessionId: 0,
    sessions: []
};

application.use((request, response, next) => {
    if(request.cookies.session !== undefined){
        var sessionId = parseInt(request.cookies.session);
        var user = storage.session[sessionId];

        if(!user) {
            response.locals.user = {isAuthenticated: false};
        }
        else{
            response.locals.user = {isAuthenticated: true};
        }
    }
    else {
        response.locals.user = {isAuthenticated: false};
    }
    next();
});

application.get('/', (request, response) => {
    response.render('index', model);
});

application.post('/', (request, response) => {
    model.clickCount++;
    model.isLoggedIn = false;
    response.locals.user = {isAuthenticated: false};
    response.render('index', model);
});

application.get('/signUp', (request, response) => {
    response.render('signUp', model);
});

application.post('/signUp', (request, response) => {
    model.singUpCount++;
    var user = {
        username: request.body.username,
        password: request.body.password
    }

    storage.users.push(user)    

    response.redirect('/logIn');
});

application.get('/logIn', (request, response) => {
    response.render('logIn', model);
});

application.post('/logIn', (request, response) => {
    model.logInCount++;
    var username = request.body.username;
    var password = request.body.password;

    var user = storage.users.find(user => {
        return user.username === username && user.password ===password
    })

    if(!user) {
        response.render('logIn', model);
    }
    else{
        var sessionId = storage.sessionId;
        storage.sessionId++;
        storage.sessionId.push(user);

        response.cookie('session', sessionId);
        model.isLoggedIn = true;

        response.redirect('/game');
    }
});

application.get('logout', (request, response) => {

});


application.listen(3000);

