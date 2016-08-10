'use strict';

import express from 'express';
import passport from 'passport';
import del from 'del';
import fs from 'fs';
import User from '../db/models/user';
import Image from '../db/models/image';
import {createToken} from './auth';

const router = express.Router({mergeParams: true});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(User.createStrategy());

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
                res.status(200).json({status: 'Registration successful!', user, token, messages: [{"text": "Successful registration!", "severity": "info"}]});
            });
        });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {return res.status(500).json({err});}
        if (!user) {
            return res.status(401).json({
                    err: info, 
                    messages: [{'text': 'Invalid username and/or password', 'severity': 'error'}]
            });
        }
        req.logIn(user, err => {
            if (err) {return res.status(500).json({err: 'Could not log in user', messages: [{'text': 'Could not log in user', 'severity': 'error'}]});}

            user = user.toObject();
            delete user.hash;
            delete user.salt;
            const token = createToken(user);

            res.status(200).json({status: 'Login successful!', user, token, messages: [{"text": "Welcome!", "severity": "info"}]});
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

router.get('/:username/timestamp', (req, res) => {
   User.find({username: req.params.username}).select({timestamp: 1}).exec((err, data) => {
       if (err) res.status(500).json({error: err});
       console.log('data: ' + data);
       res.status(200).json(data);
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
    })
    .patch((req, res) => {
        User.findOneAndUpdate({'username': req.params.username}, req.body.user, err => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({status: 'Update successful!'});
        });
    })
    .delete((req, res) => {
        User.findOneAndRemove({'username': req.params.username}, (err, user) => {
            if (err) return res.status(500).json({error: err, messages: [{'text': 'A problem occured while deleting user', 'severity': 'error'}]});

            Image.find({_author: user._id}).lean().exec((err, images) => {
                if (err) console.log('Error: ' + err);

                let img_paths = (Array.from(images)).map(img => img.url);

                if (user.avatarPath != 'img/default-avatar.jpg')
                    img_paths.push('client/' + user.avatarPath);

                console.log(img_paths);

                del(img_paths, {force: true}).then(paths => {
                    console.log('Deleted files:\n', paths.join('\n'));

                    Image.remove({_author: user._id},
                         err => {if (err)
                             return res.status(500).json({error: err, messages: [{'text': 'A problem occured while deleting images', 'severity': 'error'}]})
                        });
                });
            });
            return res.status(200).json({messages: [{'text': 'Bye!', 'severity': 'info'}]});
        });
    });

export default router;

