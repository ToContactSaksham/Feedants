const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const routes = require('./routes');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { UPLOAD_DIR } = require('./middleware/upload');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false })); // allow serving uploaded media cross-origin to the app
app.use(cors({ origin: process.env.CLIENT_ORIGIN === '*' ? true : process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '2mb' }));
app.use(mongoSanitize()); // strips $ and . operators from user input to prevent query injection
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);

// Serve locally-stored submission media (dev only - see middleware/upload.js note on S3 for prod)
app.use(`/${UPLOAD_DIR}`, express.static(path.join(process.cwd(), UPLOAD_DIR)));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
