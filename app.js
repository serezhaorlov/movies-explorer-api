require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const router = require('./routes/index');
const { handleErrors } = require('./middlewares/handleErrors');
const { DEV_DATA_BASE_PATH } = require('./utils/config');

const app = express();
const { PORT = 3000, NODE_ENV, PRODUCTION_DATA_BASE_PATH } = process.env;

mongoose.connect(NODE_ENV === 'production' ? PRODUCTION_DATA_BASE_PATH : DEV_DATA_BASE_PATH, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(cors());

app.use(express.json({ extended: true }));

app.use(helmet());

app.use(requestLogger);

app.use('/', router);

app.use(errorLogger);

app.use(errors());

app.use(handleErrors);

app.listen(PORT);
