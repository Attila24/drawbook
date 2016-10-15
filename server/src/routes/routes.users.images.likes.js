'use strict';

import express from 'express';
import async from 'async';
import Image from '../models/image';
import User from '../models/user';

const router = express.Router({mergeParams: true});

// Add a new like to an image
router.post('/', (req, res) => {
    Image.findByIdAndUpdate(req.params.imageid, {$push: {'likes': req.body.authorId}}, (err, image) => {
        if (err) res.status(500).json({error: err});
        return res.status(200).json({status: 'Registered like!'});
    });
});

// Get the likes data of an image
router.get('/', (req, res) => {
    Image.findById(req.params.imageid)
        .populate({
            path: 'likes',
            select:'_id username'
        })
        .select('likes')
        .exec((err, data) => {
           if (err) return res.status(500).json({error: err});
           else if (data == null) res.status(404).json({error: err});

           // Filter out the likes where the user has been removed
           async.filter(data.likes, (like, callback) => {
               User.count({_id: like}, (err, count) => {
                  if (err) console.log('Error: ' + err);
                  callback(null, count !== 0);
               });
           }, (err, results) => {
               // When all done, send to the user
               return res.status(200).json(results);
           });
   });
});

// Remove a like from an image
router.delete('/:id', (req, res) => {
    Image.findByIdAndUpdate(req.params.imageid, {$pull: {'likes': req.params.id}}, (err, image) => {
       if (err) res.status(500).json({error: err});
       return res.status(200).json({status: 'Unregistered like!'});
   });
});

export default router;