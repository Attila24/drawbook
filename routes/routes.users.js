var express             = require('express'),
    router              = express.Router({mergeParams: true}),
    passport            = require('passport'),
    jwt                 = require('jwt-simple'),
    moment              = require('moment'),
    //LocalStrategy       = require('passport-local').Strategy,
    User                = require('../db/models/user'),
    Image               = require('../db/models/image');

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(User.createStrategy());

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
            console.log('ez fut le');
            User.find(function(err, users) {
                if (err) res.send(err);
                res.json(users);
            });
    });

router.route('/:username')
    .get(function (req, res) {
        User.findOne({'username': req.params.username})
            .populate({path: 'images', options: {sort: {'date': -1}}})
            .exec(function(err, user) {
                if (err) {
                    console.log('error: ' + err);
                    return res.status(500).json({err: err});
                }
                return res.status(200).json({'user': user})
            });
    });

router.post('/register', function(req, res) {
    console.log(req.body);
    User.register(new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            age: req.body.age,
            gender: req.body.gender
        }), req.body.password, function(err, account) {
        if (err) {
            console.log('error: '  + err);
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

router.patch('/:username', function (req, res) {

   User.findOneAndUpdate({'username': req.params.username}, req.body.user, function (err, doc, result) {
       if (err) console.log('Error: ' + err);
       return res.status(200).json({status: 'Update successful!'});
   });

});

module.exports = router;
