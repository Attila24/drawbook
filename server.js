(function(){
   'use strict';

    // modules ==============================

    const
        express         = require('express'),
        bodyParser      = require('body-parser'),
        cookieParser    = require('cookie-parser'),
        methodOverride  = require('method-override'),
        cors            = require('cors'),
        mongoose        = require('mongoose'),
        passport        = require('passport'),
        multipart       = require('connect-multiparty'),
        app             = express();

    // configuration =======================

    const
        db      = require('./db/db'),
        port    = process.env.PORT || 5000;

    mongoose.Promise = global.Promise;
    mongoose.connect(db.url);

    app.use(bodyParser.json({limit: '50mb', extended: true}));
    app.use(bodyParser.urlencoded({ extended: true}));
    app.use(cookieParser());
    app.use(methodOverride('X-HTTP-Method-Override'));
    app.use(cors());
    app.use(multipart({
        uploadDir: 'app/uploads/avatars'
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('', express.static(__dirname + '/app'));

    // routes ==============================

    const router = require('./routes');
    app.use('/api/', router);

    // angular - html5mode reload fix
    app.use((req, res) => {
        res.sendFile(__dirname + '/app/index.html');
    });

    // error handlers ======================

    app.use((err, req, res, next) => {
        let status = err.status || 500;
        res.status(status).send({
            message: err.message,
            error: err
        });
    });

    // start ===============================

    app.listen(port);
    console.log('Listening on port 5000.');
    exports = module.exports = app;
})();
