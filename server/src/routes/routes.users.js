'use strict';

import express from 'express';
import passport from 'passport';
import User from '../models/user';
import Comment from '../models/comment';
import Image from '../models/image';
import Notification from '../models/notification';
import {createToken} from './auth';

const router = express.Router({mergeParams: true});

// Passport configurations
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(User.createStrategy());

// Register a new user to the DB.
router.post('/register', (req, res) => {
    User.register(
        new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            age: req.body.age,
            gender: req.body.gender
        }),
        req.body.password, (err, account) => {
            if (err) return res.status(500).json({error: err});

            // Authenticate user using Local Passport Strategy, create new token
            passport.authenticate('local')(req, res, () => {
                const user = account.toObject();
                delete user.hash;
                delete user.salt;
                const token = createToken(user);
                res.status(200).json({status: 'Registration successful!', user, token, messages: [{"text": "Successful registration!", "severity": "info"}]});
            });
        });
});

// Login user using Local Passport Strategy
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {

        // check for errors
        if (err) {return res.status(500).json({err});}
        if (!user) {
            return res.status(401).json({
                    err: info, 
                    messages: [{'text': 'Invalid username and/or password', 'severity': 'error'}]
            });
        }

        // login user
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

// Logout user
router.get('/logout', (req, res) => {
    req.logout();
    res.status(200).json({status: 'Bye!'});
});

// Return total amount of users in database
router.get('/count', (req, res) => {
    User.count((err, count) => {
        if (err) return res.status(500).json({error: err});
        return res.status(200).json(count);
    });
});

// Return a user or a collection of users, apply search if parameter is given
router.get('', (req, res) => {
    User.find(req.query.search ? {username: {'$regex': req.query.search}} : {})
        .sort({_id: -1})
        .limit(parseInt(req.query.limit))
        .skip(parseInt(req.query.skip))
        .exec((err, users) => {
            if (err) res.send(err);
            res.status(200).json(users);
        });
});

router.route('/:username')
    // Return a user from the DB, also select the images and followers
    .get((req, res) => {
        User.findOne({'username': req.params.username})
            .populate({path: 'images followers', options: {sort: {'date': -1}}})
            .exec((err, user) => {
                if (err) return res.status(500).json({error: err});
                return res.status(200).json({'user': user})
            });
    })
    // Update a user with the given request body.
    .patch((req, res) => {
        User.findOneAndUpdate({'username': req.params.username}, req.body.user, (err, user) => {
            if (err) return res.status(500).json({error: err});

            return res.status(200).json({status: 'Update successful!'});
        });
    })
    // Delete a user from the DB
    .delete((req, res) => {
        User.findOneAndRemove({'username': req.params.username})
            .populate({path: 'followers', select: 'feed following'})
            .populate({path: 'following', select: 'followers'})
            .exec((err, user) => {
                if (err) return res.status(500).json({error: err, messages: [{'text': 'A problem occured while deleting user', 'severity': 'error'}]});

                // Remove all notifications of the user
                for (let i = 0; i < user.notifications.length; i++) {
                    Notification.findByIdAndRemove(user.notifications[i], err => {if (err) console.log('Error: ' + err);});
                }

                // Remove all comments of the user
                Comment.remove({authorId: user._id}, err => {
                    if (err) console.log('A problem occured while deleting comments: ', err);
                });

                // Find all the images of the user
                Image.find({_author: user._id}).lean().exec((err, images) => {
                    if (err) console.log('Error: ' + err);

                    Image.remove({_author: user._id},
                        err => {if (err)
                            return res.status(500).json({error: err, messages: [{'text': 'A problem occured while deleting images', 'severity': 'error'}]})
                        });

                    // Delete presence from followers' data
                    for (let i = 0; i < user.followers.length; i++) {
                        for (let j = 0; j < images.length; j++) {
                            user.followers[i].feed.pull(images[j]._id);
                        }
                        user.followers[i].following.pull(user._id);
                        user.followers[i].save(err => {if (err) console.log('Error: ' + err);});
                    }

                    // Delete presence from followed people's data
                    for (let i = 0; i < user.following.length; i++) {
                        user.following[i].followers.pull(user._id);
                        user.following[i].save(err => {if (err) console.log('Error: ' + err);});
                    }

                });
                return res.status(200).json({messages: [{'text': 'Bye!', 'severity': 'info'}]});
        });
    });

// Return the followings of a user, limit to 10 users
router.get('/:username/following', (req, res) => {
   User.findOne({username: req.params.username})
       .populate({
           path: 'following',
           options: {
               limit: 10,
               skip: parseInt(req.query.skip)
           }
       })
       .select('following')
       .exec((err, data) => {
           if (err) return res.status(500).json({error: err});
           return res.status(200).json(data.following);
       });
});

// Return the feed of a user
router.get('/:username/feed', (req, res) => {
    User.findOne({username: req.params.username})
        .populate({
            path: 'feed',
            options: {
                sort: {'_id': -1},
                limit: 10,
                skip: parseInt(req.query.skip)
            },
            populate: {path: '_author', select: 'username avatarPath'}
        })
        .lean()
        .exec((err, user) => {
           if (err) return res.status(500).json({error: err});
           if (user == null || user.feed.length == 0) return res.status(200).json([]);

           return res.status(200).json(user.feed);

        });
});

export default router;