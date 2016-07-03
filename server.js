// modules ==============================

var express         = require('express'),
    bodyParser      = require('body-parser'),
    cookieParser    = require('cookie-parser'),
    methodOverride  = require('method-override'),
    cors            = require('cors'),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    app             = express();

// configuration =======================

var db      = require('./db/db'),
    port    = process.env.PORT || 5000;

mongoose.connect(db.url);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/app'));

// routes ==============================

var router = require('./routes');

app.use('/api/', router);

// error handlers ======================

// angular - html5mode reload fix
app.use(function(req, res) {
    res.sendFile(__dirname + '/app/index.html');
});

app.use(function(err, req, res, next) {
    var status = err.status || 500;
    res.status(status).send({
        message: err.message,
        error: err
    });
});

// start ===============================

app.listen(port);

console.log('Listening on port 5000.');

exports = module.exports = app;