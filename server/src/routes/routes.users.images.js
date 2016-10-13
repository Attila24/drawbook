'use strict';

import express from 'express';
import fs from 'fs';
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

            // convert from data URL to base64
            /*const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");

            // save image in the file system
            fs.writeFile(`server/files/${image._id}.png`, base64Data, 'base64', err => {
                if (err) console.log(`Error: ${err}`);
                console.log(`Image '${image._id}.png' saved`);
            });

            // save image in the database as a data URL
            image.url = `server/files/${image._id}.png`;*/
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

// Save a new user avatar
router.post('/avatar', ensureAuthenticated, (req, res) => {
    let path = req.files.file.path.replace('client\\', '');
    path = path.replace(/\\/g, '/');

    // Save url in the database
    User.findOneAndUpdate({username: req.params.username}, {$set: {avatarPath: path}}, (err, user) => {
        if (err) return res.status(500).json({error: err});

        // If user had previous avatar, remove it
        if (user.avatarPath != 'img/default-avatar.jpg') {
            fs.unlink('client/' + user.avatarPath, err => {if (err) console.log('Error: ' + err);});
        }

        return res.status(200).json({status: 'Successfully saved avatar', avatarPath: path});
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
            /*
            // Get image files from filesystem and convert them back to data URL
            async.each(data.images, (image, callback) => {
               fs.readFile(image.url, 'base64', (err, data) => {
                   if (err) return res.status(500).json({error: err});
                   image.data = `data:image/png;base64,${data}`;
                   callback();
               });
            }, err => {
                // When all finished, send to user
                if (err) return res.status(500).json({error: err});
                else return res.status(200).json(data);
            });*/
        });
});

// Return an image of a user
router.get('/:id', (req, res) => {
    Image.findOne({_id: req.params.id}, (err, image) => {
        if (err) return res.status(500).json({error: err});
        else if (image == null) return res.status(404).json({message: 'Not found'});
        else return res.status(200).json(image); /*{


            // Read image from filesystem, convert to data URL and send to user
            fs.readFile(image.url, 'base64', (err, data) => {
                if (err) return res.status(500).json({error: err});

                return res.status(200).json({
                    'image': image,
                    'data': `data:image/png;base64,${data}`
                });
            });
        }*/
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

            // Delete image from filesystem
            /*fs.unlink(`server/files/${req.params.id}.png`, (err) => {
               if (err) console.log('Error: ' + err);
               else console.log(`Successfully deleted image file ${req.params.id}.png`);
            });*/

            // Remove image from all the followers' feeds
            for (let i = 0; i < user.followers.length; i++) {
                user.followers[i].feed.pull(req.params.id);
                user.followers[i].save(err => {if (err) console.log('Error: ' + err);});
            }

            return res.status(200).json({status: 'Successfully deleted picture'});
    });
});

export default router;