'use strict';

import express from 'express';
import async from 'async';
import Image from '../models/image';
import User from '../models/user';
import Comment from '../models/comment';
import {ensureAuthenticated} from './auth';

const router = express.Router({mergeParams: true});

// Save a new image in the DB
router.post('/', ensureAuthenticated, (req, res) => {
    User.findOne({username: req.params.username})
        .populate({path: 'followers', select: 'feed'})
        .exec((err, user) => {
            if (err) return res.status(500).json({error: err});

            const image = new Image({
                _author: user._id,
                title: req.body.title,
                data: req.body.image
            });

            image.save(err => {if (err) return res.status(500).json({error: err});});

            // Save in the user's image array
            user.images.push(image);
            user.save(err => {if (err) return res.status(500).json({error: err});});

            // Push the new image to the all of the followers' feeds
            for (let i = 0; i < user.followers.length; i++) {
                user.followers[i].feed.push(image);
                user.followers[i].save(err => {if (err) console.log('Error: ' + err);});
            }

            return res.status(200).json({status: 'Successfully saved image'})
        });
});

// Return a user's current avatar
router.get('/avatar', (req, res) => {
   User.findOne({username: req.params.username}).select({avatarPath: 1, timestamp: 1}).exec((err, data) => {
       if (err) return res.statuts(500).json({error: err});
       return res.status(200).json(data);
   });
});

// Return the images of a user
router.get('', (req,res) => {
    User.findOne({username: req.params.username})
        .populate({
            path: 'images',
            options: {
                sort: {_id: -1},
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            }
        })
        .select('images')
        .lean()
        .exec((err, data) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json(data);
        });
});

// Return an image of a user
router.get('/:id', (req, res) => {
    Image.findOne({_id: req.params.id}, (err, image) => {
        if (err) return res.status(500).json({error: err});
        else if (image == null) return res.status(404).json({message: 'Not found'});
        else return res.status(200).json(image);
    });
});

// Update an image's title
router.patch('/:id/title', ensureAuthenticated, (req, res) => {
   Image.findByIdAndUpdate(req.params.id, {title: req.body.title}, err => {
       if (err) res.status(500).json({error: err});
       return res.status(200).json({status: 'Update successful!'});
   })
});

// Delete an image
router.delete('/:id', ensureAuthenticated, (req, res) => {
    User.findOne({username: req.params.username})
        .populate({path: 'followers', select: 'feed'})
        .exec((err, user) => {
            if (err) return res.status(500).json({error: err});

            // Remove from the user's images array
            user.images.pull(req.params.id);
            user.save(err => {if (err) return res.status(500).json({error: err});});

            // Remove image from DB
            Image.findByIdAndRemove(req.params.id, (err, image) => {
                if (err) return res.status(500).json({error: err});

                // Remove all the comments of the image
                async.each(image.comments, (comment, callback) => {
                    Comment.findByIdAndRemove(comment, (err, c) => {
                        if (err) console.log('Error: ' + err);
                        callback();
                    });
                });

            });

            // Remove image from all the followers' feeds
            for (let i = 0; i < user.followers.length; i++) {
                user.followers[i].feed.pull(req.params.id);
                user.followers[i].save(err => {if (err) console.log('Error: ' + err);});
            }

            return res.status(200).json({status: 'Successfully deleted picture'});
    });
});

export default router;