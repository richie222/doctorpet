// 1. Imports
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

// 2. Import routes
const indexRouter = require('./src/routes/index');
const dbRouter = require('./src/routes/db');
const authRouter = require('./src/routes/auth');

// 3. Import config
const { sessionCookie, poolConnection } = require('./src/config/dababase');

// 4. Initialize express
const app = express();

// 5. Basic security
app.use(helmet());

// 6. Middleware configurations
const configureMiddleware = (app) => {
  // Trust proxy settings
  app.set('trust proxy', 1);

  // View engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  // General middleware
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  // Static files configuration
  app.use('/uploads/profile-images', express.static(path.join(__dirname, 'src/public/uploads/profile-images')));
  app.use('/multimedia', express.static(path.join(__dirname, 'src/multimedia')));

  // CORS configuration
  const allowedOrigins = [
    'https://6000-firebase-studio-1746627507940.cluster-f4iwdviaqvc2ct6pgytzw4xqy4.cloudworkstations.dev',
    'https://9000-firebase-studio-1746627507940.cluster-f4iwdviaqvc2ct6pgytzw4xqy4.cloudworkstations.dev'
  ];

  app.use(
    cors({
      origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log('Origen no permitido:', origin);
          callback(new Error('No permitido por CORS'));
        }
      },
      methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
      credentials: true,
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With', 
        'device-remember-token', 
        'Access-Control-Allow-Origin', 
        'Origin', 
        'Accept'
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204
    })
  );

  // Session configuration
  app.use(session({
    store: new pgSession({
      pool: poolConnection,
      tableName: 'sessions'
    }),
    ...sessionCookie
  }));
};

// 7. Route configurations
const configureRoutes = (app) => {
  app.use('/', indexRouter);
  app.use('/db', dbRouter);
  app.use('/auth', authRouter);
};

// 8. Error handling configurations
const configureErrorHandling = (app) => {
  // 404 handler
  app.use((req, res, next) => {
    next(createError(404, 'Ruta no encontrada'));
  });

  // Global error handler
  app.use((err, req, res, next) => {
    const statusCode = err.status || 500;

    if (process.env.NODE_ENV === 'production') {
      console.error(new Date().toISOString(), {
        status: statusCode,
        message: err.message,
        stack: err.stack,
        path: req.originalUrl
      });
    }

    const errorMessage = process.env.NODE_ENV === 'production'
      ? statusCode === 404 
        ? 'Ruta no encontrada'
        : 'Error interno del servidor'
      : err.message;

    if (req.accepts('json')) {
      res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          error: err,
          stack: err.stack
        })
      });
    } else {
      res.status(statusCode);
      res.render('error', {
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? err : {}
      });
    }
  });
};

app.use((req, res, next) => {
  console.log('\n--- Nueva Petición ---');
  console.log('URL:', req.url);
  console.log('Método:', req.method);
  console.log('Cookies:', req.cookies);
  console.log('Session:', req.session);
  console.log('Headers:', req.headers);
  next();
});

// 9. Application initialization
const initializeApp = () => {
  configureMiddleware(app);
  configureRoutes(app);
  configureErrorHandling(app);
  return app;
};

// 10. Export application
module.exports = initializeApp();