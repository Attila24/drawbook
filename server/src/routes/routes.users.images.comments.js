'use strict';

import express from 'express'
import {ensureAuthenticated} from './auth';
import async from 'async';
import Comment from '../db/models/comment';
import Image from '../db/models/image';
import User from '../db/models/user';

const router = express.Router({mergeParams: true});

router.post('/', (req, res) => {

    const comment = new Comment({
        authorId: req.body.authorId,
        authorUsername: req.body.authorUsername,
        authorAvatarPath: req.body.authorAvatarPath,
        text: req.body.comment,
        imageId: req.params.imageid
    });

    comment.save(err => {if (err) return res.status(500).json({error: err});});

    Image.findByIdAndUpdate(req.params.imageid, {$push: {'comments': comment}}, (err, image) => {
        if (err) return res.status(500).json({error: err});

        return res.status(200).json(comment);
    });
});

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

router.get('/count', (req, res) => {

    Comment.find({imageId: req.params.imageid})
        .select('authorId')
        .lean()
        .exec((err, data) => {
            if (err) return res.status(500).json({error: err});

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


router.delete('/:id', ensureAuthenticated, (req, res) => {
    Comment.findByIdAndRemove(req.params.id, (err, comment) => {
       if (err) return res.status(500).json({error: err});
    });

    Image.findByIdAndUpdate(req.params.imageid, {$pull: {'comments': req.params.id}}, (err, image) => {
        if (err) return res.status(500).json({error: err});
        return res.status(200).json({status: 'Successfully deleted comment'});
    });
});


export default router;