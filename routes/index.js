const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const auth = require('../middlewares/auth');
const { login, createProfile } = require('../controllers/users');
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const NotFoundError = require('../errors/not-found-error');
const { NOT_FOUND_PAGE_ERROR } = require('../utils/responseMesseges');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().min(2),
    password: Joi.string().required().min(2),
    name: Joi.string().required().min(2).max(40),
  }),
}), createProfile);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().min(2),
    password: Joi.string().required().min(2),
  }),
}), login);

router.use('/users', auth, usersRouter);

router.use('/movies', auth, moviesRouter);

router.use('*', (req, res, next) => {
  next(new NotFoundError(NOT_FOUND_PAGE_ERROR));
});

module.exports = router;
