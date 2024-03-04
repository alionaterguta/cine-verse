const { error } = require("console");
const express = require("express"),
  uuid = require("uuid"),
  bodyParser = require("body-parser"),
  morgan = require("morgan");
const app = express();

const mongoose = require("mongoose");
const Models = require("./models");

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// mongoose.connect('mongodb://localhost:27017/movieDB', { useNewUrlParser: true, useUnifiedTopology: true });

const cors = require("cors");
app.use(cors());
const { check, validationResult } = require("express-validator");

// Logging midleware
app.use(morgan("common"));
app.use(bodyParser.json());

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

let myLogger = (req, res, next) => {
  console.log(req.url);
  next();
};

app.use(myLogger);

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to cine-verse API");
});

// READ   --  Users route
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// CREATE
app.post(
  "/users",
  [
    check("UserName", "UserName is required").isLength({ min: 5 }),
    check(
      "UserName",
      "UserName contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ UserName: req.body.UserName })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.UserName + " already exists");
        } else {
          Users.create({
            UserName: req.body.UserName,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthdate: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error " + error);
      });
  }
);

// UPDATE User data by username
app.put(
  "/users/:username",
  [
    check("UserName", "UserName is required").isLength({ min: 5 }),
    check(
      "UserName",
      "UserName contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.UserName !== req.params.username) {
      return res.status(400).send("Permission denied");
    }

    const updatedUser = {
      UserName: req.body.UserName,
      Email: req.body.Email,
      Birthdate: req.body.Birthdate,
    }
    
    if (req.body.Password) {
      updatedUser.Password = Users.hashPassword(req.body.Password);
    }

    await Users.findOneAndUpdate(
      { UserName: req.params.username },
      { $set: updatedUser },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// CREATE
app.post(
  "/users/:username/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({Title: req.params.title})
    .then( async (movie) => {
      if (!movie) {
        return res.status(404).json({error: "Movie not found"});
      }
      await Users.findOneAndUpdate(
        { UserName: req.params.username },
        { $push: { FavoriteMovies: req.params.title } },
        { new: true }
      )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
  });

// DELETE
app.delete(
  "/users/:username/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { UserName: req.params.username },
      {
        $pull: { FavoriteMovies: req.params.title },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);



// DELETE
app.delete(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userId = req.params.id;

    await Users.findByIdAndDelete(userId)
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.id + " was not found.");
        } else {
          res.status(200).send(req.params.id + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// READ   --  Movie route
app.get(
  "/movies", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
// READ   --  Director route
app.get(
  "/movies/directors", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Directors.find()
      .then((directors) => {
        res.status(201).json(directors);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
// READ
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// READ
app.get(
  "/movies/genre/:genre",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find({ Genre: req.params.genre })
      .then((movie) => {
        if (!movie.length) {
          res.status(400).send(req.params.genre + " movies were not found.");
        } else {
          res.json(movie);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// READ
app.get(
  "/movies/director/:directorName", 
   async (req, res) => {
    await Directors.findOne({ Name: req.params.directorName })
      .then((directors) => {
        if (!directors) {
          res.status(400).send(req.params.directorName + " was not found.");
        } else {
          res.json(directors);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Static file
app.use(
  "/documentation",
  express.static("public", { index: "documentation.html" })
);

// Error handling midleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
