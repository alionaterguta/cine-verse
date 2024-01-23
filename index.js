const { error } = require('console');
const express = require('express'),
morgan = require('morgan');
const app = express();

// Logging midleware
app.use(morgan('common'));

// Movie data
let topTenMovies = [
    {
        title: 'Movie1',
        director: 'Director1'
    }, 
    {
        title: 'Movie2',
        director: 'Director2'
    }, 
    {
        title: 'Movie3',
        director: 'Director3'
    }, 
    {
        title: 'Movie4',
        director: 'Director4'
    }, 
    {
        title: 'Movie5',
        director: 'Director5'
    }, 
    {
        title: 'Movie6',
        director: 'Director6'
    }, 
    {
        title: 'Movie7',
        director: 'Director7'
    }, 
    {
        title: 'Movie8',
        director: 'Director8'
    }, 
    {
        title: 'Movie9',
        director: 'Director9'
    }, 
    {
        title: 'Movie10',
        director: 'Director10'
    }
];

let myLogger = (req, res, next) => {
    console.log(req.url);
    next();
  };

  app.use(myLogger);

// Welcome route

  app.get('/', (req, res) => {
    res.send('Welcome to cine-verse API!');
});

// Movie route
app.get( '/movies', (req, res) => {
    res.json(topTenMovies);
});

//Static file
app.use('/documentation', express.static('public', {index: 'documentation.html'}));

// Error handling midleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(8080, () => {
    console.log('My first Node test server is running on Port 8080.');
});





