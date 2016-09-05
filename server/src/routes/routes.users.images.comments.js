'use strict';

import express from 'express'
import {ensureAuthenticated} from './auth';
import async from 'async';
import Comment from '../models/comment';
import Image from '../models/image';
import User from '../models/user';

const router = express.Router({mergeParams: true});

// Save a new comment in the DB
router.post('/', (req, res) => {

    const comment = new Comment({
        authorId: req.body.authorId,
        authorUsername: req.body.authorUsername,
        authorAvatarPath: req.body.authorAvatarPath,
        text: req.body.comment,
        imageId: req.params.imageid
    });

    comment.save(err => {if (err) return res.status(500).json({error: err});});

    // Add comment to the comments array of the image.
    Image.findByIdAndUpdate(req.params.imageid, {$push: {'comments': comment}}, (err, image) => {
        if (err) return res.status(500).json({error: err});

        return res.status(200).json(comment);
    });
});

// Get comments of an image, limit and skip the collection by request query.
router.get('', (req, res) => {
   Image.findById(req.params.imageid)
       .populate({
           path: 'comments',
           options: {
               sort: {_id: -1},
               limit: parseInt(req.query.limit),
               skip: parseInt(req.query.skip)
           }
       })
       .select('comments')
       .lean()
       .exec((err, data) => {
          if (err) return res.status(500).json({error: err});

           // Filter out the comments where the author has been removed.
           async.filter(data.comments, (comment, callback) => {
              User.count({_id: comment.authorId}, (err, count) => {
                  if (err) console.log('Error: ' + err);
                  callback(count !== 0);
              });
           }, (results) => {
               return res.status(200).json(results);
           });
       });
});

// Return total amount of comments on an image
router.get('/count', (req, res) => {
    Comment.find({imageId: req.params.imageid})
        .select('authorId')
        .lean()
        .exec((err, data) => {
            if (err) return res.status(500).json({error: err});

            // Filter out the comments where the author has been removed
            async.filter(data, (comment, callback) => {
                User.count({_id: comment.authorId}, (err, count) => {
                    if (err) console.log('Error: ' + err);
                    callback(count !== 0);
                });
            }, (results) => {
                return res.status(200).json(results.length);
            });
        });
});

// Delete a comment
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Comment.findByIdAndRemove(req.params.id, (err, comment) => {
       if (err) return res.status(500).json({error: err});
    });

    // Remove from the image's comments array too
    Image.findByIdAndUpdate(req.params.imageid, {$pull: {'comments': req.params.id}}, (err, image) => {
        if (err) return res.status(500).json({error: err});
        return res.status(200).json({status: 'Successfully deleted comment'});
    });
});

export default router;