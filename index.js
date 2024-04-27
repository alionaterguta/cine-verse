const { error } = require("console");
const express = require("express"),
  uuid = require("uuid"),
  bodyParser = require("body-parser"),
  swaggerUi = require("swagger-ui-express"),
  swaggerJsdoc = require("swagger-jsdoc"),
  morgan = require("morgan");
const app = express();

const mongoose = require("mongoose");
const Models = require("./models");

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;

mongoose.connect("mongodb://localhost:27017/movieDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cors = require("cors");
const { check, validationResult } = require("express-validator");

let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "https://cine-star.netlify.app",
  "http://localhost:4200",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn`t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

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

// Swagger Setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Watchlist API",
      version: "1.0.0",
    },
    components: {
      parameters: {
        authHeader: {
          name: "Authorization",
          in: "header",
          description: "JWT token for authorization",
          required: true,
          schema: {
            type: "string",
            example: "Bearer your.jwt.token.here",
          },
        },
      },
      responses: {
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "An error occurred on the server.",
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        Movie: {
          type: "object",
          properties: {
            Title: {
              type: "string",
              description: "The title of the movie",
            },
            Description: {
              type: "string",
              description: "A brief description of the movie",
            },
            Genre: {
              type: "array",
              items: {
                type: "string",
              },
              description: "The genres of the movie",
            },
            Director: {
              type: "object",
              properties: {
                Name: {
                  type: "string",
                  description: "The name of the director",
                },
                Bio: {
                  type: "string",
                  description: "A brief biography of the director",
                },
                Birth: {
                  type: "string",
                  format: "date",
                  description: "The year the director was born",
                },
                Death: {
                  type: "string",
                  format: "date",
                  description: "The year the director died",
                },
              },
              description: "The director of the movie",
            },
            ImagePath: {
              type: "string",
              description: "URL to the movie poster image",
            },
            Featured: {
              type: "boolean",
              description: "Whether the movie is featured or not",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            Username: {
              type: "string",
              description: "Name of the user",
            },
            Password: {
              type: "string",
              description: "Password of the user",
            },
            Email: {
              type: "string",
              description: "Email of the user",
            },
            Birthdate: {
              type: "string",
              format: "date",
              description: "Birthday of the user",
            },
            FavoriteMovies: {
              type: "array",
              items: {
                type: "string",
                format: "uuid",
              },
              description: "List of user's favorite movies",
            },
          },
        },
        Director: {
          type: "object",
          properties: {
            Name: {
              type: "string",
              description: "The director name",
            },
            Bio: {
              type: "string",
              description: "The short biography of the director.",
            },
            Birth: {
              type: "date",
              description: "The year the director was born.",
            },
            Death: {
              type: "date",
              description: "The year the director died.",
            },
          },
        },
      },
      description: "Watchlist API offering CRUD operations using Express",
      servers: [
        {
          url: `https://cine-verse-b8832aa84c3e.herokuapp.com/api/v1`,
          description: "Production server",
        },
      ],
    },
  },
  apis: ["./index.js"],
};
const specs = swaggerJsdoc(options);
// Adjust the Swagger UI setup to include the desired configuration
app.use(
  "/api/v1/documentation",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    //defaultModelsExpandDepth: 10, // Collapse all models by default
    docExpansion: "full", // Expand operations and tags, keep models collapsed
  })
);
// Redirect from the old route to the new one
app.get("/documentation", (req, res) => res.redirect("/api/v1/documentation"));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Retrieve the welcome message
 *     description: Returns a welcome message for the cine-verse API.
 *     responses:
 *       200:
 *         description: A welcome message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: Welcome to cine-verse API
 *       500:
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - General
 */
app.get("/", (req, res) => {
  res.send("Welcome to cine-verse API");
});

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Retrieve the list of all users
 *     description: Returns a list of all users available in the database.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Users
 */
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

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user account
 *     description: Creates a new user account with the provided information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Users'
 *             example:
 *               type: object
 *               properties:
 *                 UserName:
 *                   type: string
 *                   minLength: 5
 *                 Password:
 *                   type: string
 *                 Email:
 *                   type: string
 *                   format: email
 *                 Birthdate:
 *                   type: string
 *                   format: date
 *     responses:
 *       '201':
 *         description: Created. Returns the created user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad Request. User with the provided username already exists.
 *       '422':
 *         description: Unprocessable Entity. Validation error in request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       param:
 *                         type: string
 *                       msg:
 *                         type: string
 *                       value:
 *                         type: string
 *       '500':
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Users
 */
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

/**
 * @openapi
 * /users/{username}:
 *   put:
 *     summary: Update user data by username
 *     description: Updates user data by the provided username.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Username of the user to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserName:
 *                 type: string
 *                 minLength: 5
 *               Password:
 *                 type: string
 *               Email:
 *                 type: string
 *                 format: email
 *               Birthdate:
 *                 type: string
 *                 format: date
 *     responses:
 *       '200':
 *         description: OK. Returns the updated user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad Request. Permission denied or validation error.
 *       '401':
 *         description: Unauthorized. Missing or invalid JWT token.
 *       '500':
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Users
 */
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
    };

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

/**
 * @openapi
 * /users/{username}/movies/{title}:
 *   post:
 *     summary: Add a movie to user's favorite list
 *     description: Adds a movie with the provided title to the favorite movies list of the user with the specified username.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Username of the user.
 *         schema:
 *           type: string
 *       - in: path
 *         name: title
 *         required: true
 *         description: Title of the movie.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Returns the updated user with the added movie.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: Not Found. The specified movie does not exist.
 *       '500':
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Users
 */
app.post(
  "/users/:username/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.title })
      .then(async (movie) => {
        if (!movie) {
          return res.status(404).json({ error: "Movie not found" });
        }

        await Users.findOneAndUpdate(
          { UserName: req.params.username },
          { $push: { FavoriteMovies: req.params.title } },
          { new: true }
        ).then((updatedUser) => {
          res.json(updatedUser);
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * @openapi
 * /users/{username}/movies/{title}:
 *   delete:
 *     summary: Remove a movie from user's favorite list
 *     description: Removes a movie with the provided title from the favorite movies list of the user with the specified username.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Username of the user.
 *         schema:
 *           type: string
 *       - in: path
 *         name: title
 *         required: true
 *         description: Title of the movie to remove.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Returns the updated user without the removed movie.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '500':
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Users
 */
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
/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Deletes a user with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. The user was successfully deleted.
 *       '400':
 *         description: Bad Request. The user with the specified ID was not found.
 *       '500':
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Users
 */
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
/**
 * @openapi
 * /movies:
 *   get:
 *     summary: Retrieve the list of all movies
 *     description: Returns a list of all movies available in the database.
 *     parameters:
 *       - $ref: '#/components/parameters/authHeader'
 *     responses:
 *       200:
 *         description: A list of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *             example:
 *               - Title: "Kill Bill: Volume 1"
 *                 Description: "A pregnant assassin, code-named The Bride, goes into a coma for four years after her
 *                              ex-boss Bill brutally attacks her. When she wakes up, she sets out to seek revenge on him and his associates."
 *                 Genre: ["Action"]
 *                 Director: "Quentin Tarantino"
 *                 Featured: true
 *                 ImgPath: "https://media.themoviedb.org/t/p/original/mt4e0L5prfCzHhpxmxt5pvfHI0p.jpg"
 *       500:
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Movies
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
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

/**
 * @openapi
 * /movies/directors:
 *   get:
 *     summary: Retrieve the list of all directors
 *     description: Returns a list of all directors available in the database.
 *     responses:
 *       '200':
 *         description: OK. Returns a list of directors.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Director'
 *       '500':
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Movies
 */
app.get(
  "/movies/directors",
  passport.authenticate("jwt", { session: false }),
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

/**
 * @openapi
 * /movies/{title}:
 *   get:
 *     summary: Retrieve a movie by title
 *     description: Returns the movie with the specified title.
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         description: Title of the movie to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Returns the movie with the specified title.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       '404':
 *         description: Not Found. The movie with the specified title was not found.
 *       '500':
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Movies
 */
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

/**
 * @openapi
 * /movies/genre/{genre}:
 *   get:
 *     summary: Retrieve movies by genre
 *     description: Returns a list of movies with the specified genre.
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         description: Genre of the movies to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Returns a list of movies with the specified genre.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       '400':
 *         description: Bad Request. No movies found for the specified genre.
 *       '500':
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Movies
 */
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

/**
 * @openapi
 * /movies/director/{directorName}:
 *   get:
 *     summary: Retrieve director by name
 *     description: Returns the director with the specified name.
 *     parameters:
 *       - in: path
 *         name: directorName
 *         required: true
 *         description: Name of the director to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Returns the director with the specified name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Director'
 *       '400':
 *         description: Bad Request. The director with the specified name was not found.
 *       '500':
 *         $ref: '#/components/responses/500'
 *     tags:
 *       - Movies
 */
app.get("/movies/director/:directorName", async (req, res) => {
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
});

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

/**
 * Starts the Express server and listens on the specified port.
 * @param {number} port - The port number on which the server will listen.
 *                        If not provided, defaults to 8080.
 */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
