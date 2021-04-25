const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const isURL = require('validator/lib/isURL');
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');
const { INVALID_DATA_ERROR } = require('../utils/responseMesseges');

const customValidationUrl = (value, helpers) => {
  if (isURL(value)) {
    return value;
  }
  return helpers.message(INVALID_DATA_ERROR);
};

router.get('/', getMovies);

router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().custom(customValidationUrl),
      trailer: Joi.string().required().custom(customValidationUrl),
      thumbnail: Joi.string().required().custom(customValidationUrl),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie,
);

router.delete(
  '/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().required().length(24).hex(),
    }),
  }),
  deleteMovie,
);

module.exports = router;
