const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const AuthError = require('../errors/auth-error');
const { DEV_JWT_SECRET } = require('../utils/config');
const { AUTH_REQUIRED_ERROR } = require('../utils/responseMesseges');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthError(AUTH_REQUIRED_ERROR);
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : DEV_JWT_SECRET);
  } catch (err) {
    throw new AuthError(AUTH_REQUIRED_ERROR);
  }

  req.user = payload;

  next();
};
