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

var allowlist = ['https://6000-firebase-studio-1746627507940.cluster-f4iwdviaqvc2ct6pgytzw4xqy4.cloudworkstations.dev', 'https://9000-firebase-studio-1746627507940.cluster-f4iwdviaqvc2ct6pgytzw4xqy4.cloudworkstations.dev','http://localhost:3000']

// Set middleware of CORS 
app.use(
  cors({
    origin: allowlist,
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
    next(createError(404));
  });

  // Global error handler
  app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
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