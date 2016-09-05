'use strict';

import express from 'express';
import passport from 'passport';
import del from 'del';
import fs from 'fs';
import async from 'async';
import User from '../db/models/user';
import Image from '../db/models/image';
import Notification from '../db/models/notification';
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
        req.body.password, (err, account) => {
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

router.get('/count', (req, res) => {
    User.count((err, count) => {
        if (err) return res.status(500).json({error: err});
        return res.status(200).json(count);
    });
});

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
    .get((req, res) => {
        User.findOne({'username': req.params.username})
            .populate({path: 'images followers', options: {sort: {'date': -1}}})
            .exec((err, user) => {
                if (err) return res.status(500).json({error: err});
                return res.status(200).json({'user': user})
            });
    })
    .patch((req, res) => {
        User.findOneAndUpdate({'username': req.params.username}, req.body.user, (err, user) => {
            if (err) return res.status(500).json({error: err});

            let condition =
                    req.body.user.avatarPath &&
                    req.body.user.avatarPath != user.avatarPath &&
                    user.avatarPath != 'img/default-avatar.jpg';

            if (condition) {
                del('client/' + user.avatarPath, {force: true}).then(paths => {
                   console.log('Deleted files:\n', paths.join('\n'));
                });
            }

            return res.status(200).json({status: 'Update successful!'});
        });
    })
    .delete((req, res) => {
        User.findOneAndRemove({'username': req.params.username})
            .populate({path: 'followers', select: 'feed following'})
            .populate({path: 'following', select: 'followers'})
            .exec((err, user) => {
                if (err) return res.status(500).json({error: err, messages: [{'text': 'A problem occured while deleting user', 'severity': 'error'}]});

                for (let i = 0; i < user.notifications.length; i++) {
                    Notification.findByIdAndRemove(user.notifications[i], err => {if (err) console.log('Error: ' + err);});
                }

                Image.find({_author: user._id}).lean().exec((err, images) => {
                    if (err) console.log('Error: ' + err);

                    let img_paths = (Array.from(images)).map(img => img.url);

                    if (user.avatarPath != 'img/default-avatar.jpg')
                        img_paths.push('client/' + user.avatarPath);

                    del(img_paths, {force: true}).then(paths => {
                        console.log('Deleted files:\n', paths.join('\n'));

                        Image.remove({_author: user._id},
                             err => {if (err)
                                 return res.status(500).json({error: err, messages: [{'text': 'A problem occured while deleting images', 'severity': 'error'}]})
                            });
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

            async.each(user.feed, (image, callback) => {
                fs.readFile(image.url, 'base64', (err, data) => {
                    if (err) return res.status(500).json({error: err});
                    image.data = `data:image/png;base64,${data}`;
                    callback();
                });
            }, err => {
                if (err) return res.status(500).json({error: err});
                else res.status(200).json(user.feed);
            });
        });
});


export default router;

