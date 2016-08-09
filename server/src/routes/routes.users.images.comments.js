'use strict';

import express from 'express'
import mongoose from 'mongoose';
import {ensureAuthenticated} from './auth';
import CommentSchema from '../db/models/comment';
import Image from '../db/models/image';

const router = express.Router({mergeParams: true});

router.post('/', (req, res) => {
    Image.findOne({_id: req.params.imageid}, (err, image) => {
        if (err) return res.status(500).json({error: err});

        const Comment = mongoose.model('Comment', CommentSchema);
        const comment = new Comment({
            author: req.body.author,
            authorTimestamp: req.body.authorTimestamp,
            text: req.body.comment
        });

        image.comments.push(comment);
        image.save(err => {if (err) return res.status(200).json({error: err});});

        return res.status(200).json({status: 'Successfully posted comment'});
    });
});

router.get('/:id', (req, res) => {
    Image.findOne({_id: req.params.imageid}, (err, image) => {
        if (err) return res.status(500).json({error: err});
        return res.status(200).json({comments: image.comments});
    });
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
   Image.findOne({_id: req.params.imageid}, (err, image) => {
      if (err) return res.status(500).json({error: err});

       image.comments.pull({_id: req.params.id});
       image.save(err=> {if (err) return res.status(500).json({error: err});});

       return res.status(200).json({status: 'Successfully deleted comment'});

   });
});


export default router;