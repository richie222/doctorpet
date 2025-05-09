//imports
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require ('dotenv').config();


// Import routes
var indexRouter = require('./src/routes/index');
var dbRouter = require('./src/routes/db');
const authRouter = require('./src/routes/auth');

// Import config
const {sessionCookie, poolConnection} = require('./src/config/dababase');

var app = express();

app.use(helmet());

// Limitar intentos de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5 // 5 intentos
});

// Middleware configurations
const configureMiddleware = (app) => {

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

  // Para imágenes de perfil
  app.use('/uploads/profile-images', express.static(path.join(__dirname, 'src/public/uploads/profile-images')));
  // Para la imagen por defecto
  app.use('/multimedia', express.static(path.join(__dirname, 'src/multimedia')));

  // Session middleware
  app.use(session({
    store: new pgSession({
      pool: poolConnection,
      tableName: 'sessions'
    }),
    ...sessionCookie
  }));
};

// Set middleware of CORS 
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Route configurations
const configureRoutes = (app) => {
  app.use('/', indexRouter);
  app.use('/db', dbRouter);
  app.use('/auth', authRouter);
};


// Error handling configurations
const configureErrorHandling = (app) => {
  // 404 handler
  app.use((req, res, next) => {
    next(createError(404, 'Ruta no encontrada'));
  });

  // Global error handler
  app.use((err, req, res, next) => {
    // Establecer el código de estado
    const statusCode = err.status || 500;

    // Log del error en producción
    if (process.env.NODE_ENV === 'production') {
      console.error(new Date().toISOString(), {
        status: statusCode,
        message: err.message,
        stack: err.stack,
        path: req.originalUrl
      });
    }

    // Determinar el mensaje de error según el ambiente
    const errorMessage = process.env.NODE_ENV === 'production'
      ? statusCode === 404 
        ? 'Ruta no encontrada'
        : 'Error interno del servidor'
      : err.message;

    // Responder según el tipo de contenido aceptado
    if (req.accepts('json')) {
      // Respuesta JSON para API
      res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: errorMessage,
        // Solo incluir detalles adicionales en desarrollo
        ...(process.env.NODE_ENV === 'development' && {
          error: err,
          stack: err.stack
        })
      });
    } else {
      // Respuesta HTML
      res.status(statusCode);
      res.render('error', {
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? err : {}
      });
    }
  });
};

// Initialize application
const initializeApp = () => {
  configureMiddleware(app);
  configureRoutes(app);
  configureErrorHandling(app);
  return app; 
};

module.exports = initializeApp();