var express             = require('express'),
    router              = express.Router({mergeParams: true}),
    passport            = require('passport'),
    jwt                 = require('jwt-simple'),
    moment              = require('moment'),
    LocalStrategy       = require('passport-local').Strategy,
    User                = require('../db/models/user');

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(User.createStrategy());

function ensureAuthenticated(req, res, next) {
    if (!(req.headers && req.headers.authorization)) {
        return res.status(400).send({
            message: 'You did not provide a JSON Web Token in the authorization header'
        });
    }

    // decode the token
    var header = req.headers.authorization.split(' ');
    var token = header[1];
    var payload = jwt.decode(token, 'secret');
    var now = moment().unix();

    if (now > payload.exp) {
        return res.status(401).send({
            message: 'Token has expired.'
        });
    }

    User.findById(payload.sub, function(err, user) {
        if (!user) {
            return res.status(400).send({
                message: 'User no longer exists.'
            });
        }
        req.user = user;
        next();
    });
}

function createToken(user) {
    var payload = {
        exp: moment().add(14, 'days').unix(),
        iat: moment().unix(),
        sub: user._id
    };
    return jwt.encode(payload, 'secret');
}


router.post('/login', function(req, res, next) {

    passport.authenticate('local', function(err, user, info) {
        if (err) {return res.status(500).json({err: err});}
        if (!user) {return res.status(401).json({err: info});}
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({err: 'Could not log in user'});
            }
            user = user.toObject();
            delete user.hash;
            delete user.salt;
            var token = createToken(user);

            res.status(200).json({status: 'Login successful!', user: user, token: token});
        });
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json({status: 'Bye!'});
});

router.route('/')
    .get(function(req, res) {

        User.find(function(err, users) {

            if (err) res.send(err);
            res.json(users);
        });
    });

router.post('/register', function(req, res) {
    console.log(req.body);
    User.register(new User({ username: req.body.username }), req.body.password, function(err, account) {
        if (err) {
            console.log('err: '  + err);
            return res.status(500).json({err: err});
        }
        passport.authenticate('local')(req, res, function () {
            var user = account.toObject();
            delete user.hash;
            delete user.salt;
            var token = createToken(user);
            return res.status(200).json({status: 'Registration successful!', user: user, token: token});
        });
    });
});


module.exports = router;
