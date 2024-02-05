const { error } = require('console');
const express = require('express'),
uuid = require('uuid'),
bodyParser = require('body-parser'),
morgan = require('morgan');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models');

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;

mongoose.connect('mongodb://localhost:27017/movieDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Logging midleware
app.use(morgan('common'));
app.use(bodyParser.json());

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
app.get('/users', async (req, res) => {
    await Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) =>{
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// CREATE
app.post('/users', async (req, res) => {
    await Users.findOne({UserName: req.body.UserName})
    .then((user)=>{
        if (user) {
        return res.status(400).send(req.body.UserName + ' already exists');
    } else {
        Users
        .create({
            UserName: req.body.UserName,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthdate: req.body.Birthday
        })
        .then((user) => {
            res.status(201).json(user)
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        })
    }
})
.catch((error) => {
    console.error(error);
    res.status(500).send('Error ' + error);
});

    //     res.status(400).send('users need names');
    // } 
});

// UPDATE User data by username
app.put('/users/:username', async (req, res)=>{
    await Users.findOneAndUpdate({ UserName: req.params.username},
        { $set:
            {
              Username: req.body.UserName,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthdate: req.body.Birthdate
            }
          }, {new: true})
          .then ((updatedUser) => {
            res.json(updatedUser);
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
          })

    // if (user){
    //     user.name = updatedUser.name;
    //     res.status(200).json(user);
    // } else{
    //     res.status(400).send('no such user');
    // }
});

// CREATE
app.post('/users/:username/movies/:movieId', async (req, res)=>{
    await Users.findOneAndUpdate({ UserName: req.params.username}, {
        $push:{FavoriteMovies: req.params.movieId}
    }, 
    { new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

// DELETE
app.delete('/users/:username/movies/:movieId', async (req, res)=>{
    await Users.findOneAndUpdate({ UserName: req.params.username}, {
        $pull:{FavoriteMovies: req.params.movieId}
    }, 
    { new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

// DELETE
app.delete('/users/:username', async (req, res)=>{ 
    await Users.findOneAndRemove({ UserName: req.params.username})
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.username + ' was not found.');
        } else {
            res.status(200).send(req.params.username + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// READ   --  Movie route
app.get( '/movies', async (req, res) => {
    await Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) =>{
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// READ 
app.get('/movies/:title',  async (req, res) =>{
    await Movies.findOne({Title: req.params.title})
    .then((movie)=>{
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

// READ 
app.get('/movies/genre/:genre', async (req, res) =>{
    await Movies.find({ Genre: req.params.genre})
    .then((movie)=>{
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
    // const { genre } = req.params;
    // const genreName = topMovies.find( movie => movie.Genre === genre ).Title;

    // if( genreName) {
    // res.status(200).json(genreName);
    // } else {
    // res.status(400).send('no such genre found')
    // }
});

// READ 
app.get('/movies/director/:directorName', async (req, res) =>{
    await Directors.findOne({Name: req.params.directorName})
    .then((directors)=>{
        if (!directors) {
            res.status(400).send(req.params.directorName + ' was not found.');
    }   else{
            res.json(directors);
        }
        
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
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





