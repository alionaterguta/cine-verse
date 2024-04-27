const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
/**
 * Represents a movie in the application.
 * @typedef {Object} Movie
 * @property {string} Title - The title of the movie.
 * @property {string} Description - The description of the movie.
 * @property {ImgPath} Image - The image URL.
 * @property {string[]} Genre - The movie genre.
 * @property {string[]} FavoriteMovies - An array of favorite movie titles.
 * @property {boolean} Featured - The movie is featured or not.
 */
let movieSchema = mongoose.Schema({
  ImgPath: String,
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: [String],
  Director: { type: String, required: true },
  Featured: Boolean,
});

/**
 * Represents a user in the application.
 * @typedef {Object} User
 * @property {string} UserName - The username of the user.
 * @property {string} Email - The email address of the user.
 * @property {string} Password - The hashed password of the user.
 * @property {Date} Birthdate - The birthdate of the user.
 * @property {string[]} FavoriteMovies - An array of favorite movie titles.
 */
let userSchema = mongoose.Schema({
  UserName: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthdate: Date,
  FavoriteMovies: [{ type: String, required: true }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};
/**
 * Represents a director in the application.
 * @typedef {Object} Director
 * @property {string} Name - The director's name.
 * @property {string} Bio - The short biography of the director.
 * @property {Date} Birth - The year the director was born.
 * @property {Date} Death - The year the director died.
 */
let directorSchema = mongoose.Schema({
  Name: { String },
  Bio: { String },
  Birth: { type: Date },
  Death: { type: Date },
});
/**
 * Defining variables to represent the Movie, User, and Director schemas.
 */
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);
let Director = mongoose.model("Directors", directorSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
