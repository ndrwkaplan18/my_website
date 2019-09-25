const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const weather = require('./weather.js');
const port = process.env.PORT || 3000;

var app = express();

hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

app.use((req, res, next) => {
    var now = new Date().toString();
    var log = `${now}: ${req.method} ${req.url}`;
    console.log(log);
    fs.appendFile('server.log',log + '\n', (err) => {
        if(err){
            console.log('Unable to append server.log.');
        }
    });
    next();
});

app.use(express.static(__dirname + '/public'));

// app.use((req, res, next) => {
//     res.render('maintenance.hbs', {
//         pageTitle: 'Uh oh!',
//         pageClass: 'maintenance'
//     });
// });

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
})

hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
});

hbs.registerHelper('getWeather', (address) => {
    return weather.getWeather(address);
})

app.get('/', (req, res) => {
    // res.send('<h1>Hello express!</h1>');
    res.render('home.hbs', {
        pageTitle: 'Home',
        pageClass: 'home',
        welcomeMessage: 'Welcome to akaplansoftware.com!'
    });
});

app.get('/about', (req, res) => {
    res.render('about.hbs', {
        pageTitle: 'About',
        pageClass: 'about'
    });
});

app.get('/projects', (req, res) => {
    res.render('projects.hbs', {
        pageTitle: 'Projects',
        pageClass: 'projects',
        // weather: getWeather()
    });
})

app.get('/bad', (req, res) => {
    res.send({
        errorMessage: 'Could not fulfill request. SAAHRRY'
    })
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});