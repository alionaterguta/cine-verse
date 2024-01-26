const { error } = require('console');
const express = require('express'),
uuid = require('uuid'),
bodyParser = require('body-parser'),
morgan = require('morgan');
const app = express();

// Logging midleware
app.use(morgan('common'));

app.use(bodyParser.json());

// Users data
let users = [
    {
        id:1,
        name: 'Bob',
        favoriteMovie: []
    },
    {
        id:2,
        name: 'Nina',
        favoriteMovie: []
    },
]

// Movie data
let topMovies = [
    {
        'Title': 'The Lord of the Rings: The Return of the King',
        'Description': 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring. ',
        'Director': { 
        'Name': 'Peter Jackson',
        'Bio': 'Sir Peter Robert Jackson is a New Zealand film director, screenwriter and producer. He is best known as the director, writer and producer of the Lord of the Rings trilogy and the Hobbit trilogy, both of which are adapted from the novels of the same name by J. R. R. Tolkien.', 
        'Birth': 'October 31, 1961 (age 62 years), Pukerua Bay, Porirua, New Zealand'
       },
        'Genre': 'Adventure'
    }, 
    {
        'Title': 'The Pianist',
        'Genre': 'Drama',
        'Description': 'During the WWII, acclaimed Polish musician Wladyslaw faces various struggles as he loses contact with his family. As the situation worsens, he hides in the ruins of Warsaw in order to survive.',
        'Director': { 
        'Name': 'Roman Polanski',
        'Bio': 'Raymond Roman Thierry Polański is a French and Polish film director, producer, screenwriter, and actor. He is the recipient of  numerous accolades, including an Academy Award, two British Academy Film Awards, ten César Awards, two Golden Globe Awards, as well as the Golden Bear and a Palme d\'Or.',
        'Birth': 'August 18, 1933 (age 90 years), Paris, France'
        }
        
    }   
];

let myLogger = (req, res, next) => {
    console.log(req.url);
    next();
  };

  app.use(myLogger);

// Welcome route
  app.get('/', (req, res) => {
    res.send('Welcome to cine-verse API');
});

// READ   --  Users route
app.get('/users', (req, res) => {
    res.status(200).json(users);
});

// CREATE
app.post('/users', (req, res)=>{
    const newUser = req.body;
    if (newUser.name){
        newUser.id = uuid.v4();
        users.push(newUser);

        res.status(201).json(newUser);
    } else{
        res.status(400).send('users need names');
    } 
});

// UPDATE
app.put('/users/:id', (req, res)=>{
    const { id } = req.params;
    const updatedUser = req.body;
    
    let user = users.find( user => user.id == id);

    if (user){
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else{
        res.status(400).send('no such user');
    }
});

// CREATE
app.post('/users/:id/:movieTitle', (req, res)=>{
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if (user){
        user.favoriteMovie.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}\'s array`);
    } else{
        res.status(400).send('no such user');
    }
});

// DELETE
app.delete('/users/:id/:movieTitle', (req, res)=>{
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if (user){
        user.favoriteMovie = user.favoriteMovie.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}\'s array`);
    } else{
        res.status(400).send('no such user');
    }
});

// DELETE
app.delete('/users/:id/', (req, res)=>{
    const { id } = req.params;

    let user = users.find( user => user.id == id);

    if (user){
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id} has been deleted`);
    } else{
        res.status(400).send('no such user');
    }
});

// READ   --  Movie route
app.get( '/movies', (req, res) => {
    res.status(200).json(topMovies);
});

// READ 
app.get('/movies/:title', (req, res) =>{
    const { title } = req.params;
    const movie = topMovies.find( movie => movie.Title === title );

    if( movie) {
    res.status(200).json(movie);
    } else {
    res.status(400).send('no such title found')
    }
});

// READ 
app.get('/movies/genre/:genre', (req, res) =>{
    const { genre } = req.params;
    const genreName = topMovies.find( movie => movie.Genre === genre ).Title;

    if( genreName) {
    res.status(200).json(genreName);
    } else {
    res.status(400).send('no such genre found')
    }
});

// READ 
app.get('/movies/director/:directorName', (req, res) =>{
    const { directorName } = req.params;
    const director = topMovies.find( movie => movie.Director.Name === directorName ).Director;

    if( director) {
    res.status(200).json(director);
    } else {
    res.status(404).send('no such director')
    }
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





