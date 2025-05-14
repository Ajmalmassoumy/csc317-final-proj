//Import environment config
var config = require('./config');

//Register middlewares
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const fs = require("fs");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var livereload = require('livereload');
var connectLivereload = require('connect-livereload');

//Create express app
var app = express();

//Database
//Import database
var { openDb, setupDb } = require('./scripts/db/init');
//Initialize database connection
var db = openDb();

// import routers
var createRouters = require('./routes/router');

// Create database tables
(async () => {
  await setupDb(db);
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// register logging interface
if (config.debug) {
  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(__dirname, 'public'));

  // Watch views folder for .jade/.pug changes
  liveReloadServer.watch(path.join(__dirname, 'views')); // or './views' depending on your structure

  app.use(connectLivereload());

  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });

  app.use(logger('dev'));
}

if (config.production) {
  const manifestPath = path.join(__dirname, "public/dist/manifest.json");

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    app.locals.manifest = manifest;
  }
}


//register auth middleware
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: config.session.secure }
}))

app.use((req, res, next) => {
  res.locals.user = {
    email: req.session?.email,
  };
  next();
});

// register json response middleware
app.use(express.json());

// register url encoding middleware
app.use(express.urlencoded({ extended: true }));

// register cookie middleware
app.use(cookieParser());

//mount static dir
app.use(express.static(path.join(__dirname, 'public')));

//register all routers
createRouters(app, db);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Optional: close DB when app is shutting down
process.on('SIGINT', () => {
  console.log('Closing database...');
  db.close((err) => {
      if (err) {
          console.error('Error closing database:', err.message);
      } else {
          console.log('Database connection closed.');
      }
      process.exit(0);
  });
});

module.exports = app;
