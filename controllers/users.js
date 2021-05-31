const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const ExistedError = require('../errors/conflict-error');
const { DEV_JWT_SECRET } = require('../utils/config');
const {
  NOT_FOUND_DATA_ERROR, EXISTED_EMAIL_ERROR, SUCCSESS_REG_MESSAGE,
} = require('../utils/responseMesseges');

const getUser = (req, res, next) => {
  const id = req.user._id;
  User.findById(id)
    .orFail(() => {
      throw new NotFoundError(NOT_FOUND_DATA_ERROR);
    })
    .then((user) => {
      res.status(200).send({
        email: user.email,
        name: user.name,
      });
    })
    .catch((err) => next(err));
};

const updateProfile = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    { runValidators: true, new: true },
  )
    .orFail(() => {
      throw new NotFoundError(NOT_FOUND_DATA_ERROR);
    })
    .then((updateData) => {
      res.status(200).send({
        newEmail: updateData.email,
        newName: updateData.name,
      });
    })
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        return next(new ExistedError(EXISTED_EMAIL_ERROR));
      }
      return next(err);
    });
};

const createProfile = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      res.status(200).send({
        message: SUCCSESS_REG_MESSAGE,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        return next(new ExistedError(EXISTED_EMAIL_ERROR));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : DEV_JWT_SECRET,
        {
          expiresIn: '7d',
        },
      );
      res.status(200).send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getUser,
  updateProfile,
  createProfile,
  login,
};
