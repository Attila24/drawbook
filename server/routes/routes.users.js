((() => {
    'use strict';

    const express           = require('express'),
        router              = express.Router({mergeParams: true}),
        passport            = require('passport'),
        jwt                 = require('jwt-simple'),
        moment              = require('moment'),
        User                = require('../db/models/user');

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    passport.use(User.createStrategy());

    function createToken(user) {
        const payload = {
            exp: moment().add(14, 'days').unix(),
            iat: moment().unix(),
            sub: user._id
        };
        return jwt.encode(payload, 'secret');
    }

    router.post('/login', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {return res.status(500).json({err});}
            if (!user) {return res.status(401).json({err: info});}
            req.logIn(user, err => {
                if (err) {return res.status(500).json({err: 'Could not log in user'});}

                user = user.toObject();
                delete user.hash;
                delete user.salt;
                const token = createToken(user);

                res.status(200).json({status: 'Login successful!', user, token});
            });
        })(req, res, next);
    });

    router.get('/logout', (req, res) => {
        req.logout();
        res.status(200).json({status: 'Bye!'});
    });

    router.get('/', (req, res) => {
        User.find((err, users) => {
            if (err) res.send(err);
            res.status(200).json(users);
        });
    });

    router.route('/:username')
        .get((req, res) => {
            User.findOne({'username': req.params.username})
                .populate({path: 'images', options: {sort: {'date': -1}}})
                .exec((err, user) => {
                    if (err) return res.status(500).json({error: err});
                    return res.status(200).json({'user': user})
                });
        });

    router.post('/register', (req, res) => {
        User.register(
            new User({
                username: req.body.username,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                age: req.body.age,
                gender: req.body.gender
            }),
            req.body.password,
            (err, account) => {
                if (err) return res.status(500).json({error: err});

                passport.authenticate('local')(req, res, () => {
                    const user = account.toObject();
                    delete user.hash;
                    delete user.salt;
                    const token = createToken(user);
                    return res.status(200).json({status: 'Registration successful!', user, token});
                });
            });
    });

    router.patch('/:username', (req, res) => {
        User.findOneAndUpdate({'username': req.params.username}, req.body.user, err => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({status: 'Update successful!'});
        });
    });

    module.exports = router;
}))();
