//Dependencies
const express = require('express')
const app = express();
const PORT = process.env.PORT || 8000
var cookieParser = require('cookie-parser')
var errorHandler = require('./lib/errorHandler')
var responder = require('./lib/respond')
var moment = require('moment')
var cors = require('cors')
const util = require('util');
const utility = require('./modules/utility');

const path = require('path');
//static files and render engine

app
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs");

app.use(cookieParser())

//BodyParser
var bodyParser = require('body-parser');
var urlPrsr = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({
    limit: '1000mb',
    extended: true,
    parameterLimit: 500000000
}));


app.use(bodyParser.json());

var cors = function(req, res, next) {
  
  var whitelist = [];

  if (!process.env.databaseConnection) {
    whitelist.push( 'http://localhost:8080');
  }

  var origin = req.headers.origin;
  if (whitelist.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
  next();
}

app.use(cors);

// database

const mysql = require('mysql2');

const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'calculator'
});


// server listening
var server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

var authCheck = require('./controllers/authcheck')(urlPrsr, app, errorHandler, responder, mysqlConnection);

var user = require('./api/user')(urlPrsr, app, authCheck, errorHandler, responder, mysqlConnection);

var test = require('./api/test')(urlPrsr, app, errorHandler, responder, mysqlConnection);

var calculator = require('./api/calculator')(urlPrsr, app,  authCheck, errorHandler, responder, mysqlConnection);
