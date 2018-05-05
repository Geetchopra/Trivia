let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let routes = require('./src/routes/router');
var methodOverride = require('method-override')

// change the port for your own machine here (if you'd like)
const PORT = process.env.PORT || 5000;

// PlEASE DO NOT CHANGE THIS
const DBPATH = 'mongodb://web-dev-309:tZWLaRkxUsS0e0fC'
+ '@palveez-cluster-309-shard-00-00-pjjhl.mongodb.net:27017,'
+ 'palveez-cluster-309-shard-00-01-pjjhl.mongodb.net:27017,'
+ 'palveez-cluster-309-shard-00-02-pjjhl.mongodb.net:27017'
+ '/trivia?ssl=true&replicaSet=Palveez-Cluster-309-shard-0&authSource=admin';

// connect to MongoDB Atlas Cluster
mongoose.connect(DBPATH);
let db = mongoose.connection;

// check mongo connection and errors
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
});

// use express-sessions to track users
app.use(session({
  secret: 'csc 309 trivia',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// view engine configuration to render EJS templates
app.set('views', __dirname + '/src/views');
app.set('view engine', 'ejs');

// for incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// for put and delete
app.use(methodOverride('_method'))

// for static files such as style.css
app.use(express.static(__dirname + '/src/views'));

app.use('/', routes);

// 404 error forwarded to error handler
app.use((req, res, next) => {
  let err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// MUST be the last callback (error handler)
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(PORT, () => {
  console.log(`TRIVIA app listening on port ${PORT}`);
});
