const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');
const ValidationError = require('../errors/validation-error');
const ExistedError = require('../errors/conflict-error');
const {
  NOT_FOUND_DATA_ERROR,
  NO_ACCESS_RIGHTS_ERROR,
  EXISTED_MOVIE_ID_ERROR,
  SUCCSESS_DELETE_MESSAGE,
  SUCCSESS_CREATE_MESSAGE,
} = require('../utils/responseMesseges');

const getMovies = (req, res, next) => {
  const { _id } = req.user;
  Movie.find({ owner: _id }).select('-owner')
    .then((movies) => res.status(200).send(movies))
    .catch((err) => next(err));
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      res.status(200).send({
        message: SUCCSESS_CREATE_MESSAGE,
        newMovie: movie,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError(err.message));
      } if (err.name === 'MongoError' && err.code === 11000) {
        return next(new ExistedError(EXISTED_MOVIE_ID_ERROR));
      }
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  Movie.findOne({ _id: req.params.movieId })
    .orFail(() => {
      throw new NotFoundError(NOT_FOUND_DATA_ERROR);
    })
    .then((movie) => {
      if (String(movie.owner) !== owner) {
        throw new ForbiddenError(NO_ACCESS_RIGHTS_ERROR);
      }
      return Movie.findByIdAndRemove(movie._id).select('-owner');
    })
    .then((movie) => {
      res.status(200).send({
        message: SUCCSESS_DELETE_MESSAGE,
        deleteMovie: movie,
      });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
