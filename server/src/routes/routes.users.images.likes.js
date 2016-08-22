'use strict';

import express from 'express';
import async from 'async';
import Image from '../db/models/image';
import User from '../db/models/user';

const router = express.Router({mergeParams: true});

router.post('/', (req, res) => {
    Image.findByIdAndUpdate(req.params.imageid, {$push: {'likes': req.body.authorId}}, (err, image) => {
        if (err) res.status(500).json({error: err});
        return res.status(200).json({status: 'Registered like!'});
    });
});

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

           async.filter(data.likes, (like, callback) => {
               User.count({_id: like}, (err, count) => {
                  if (err) console.log('Error: ' + err);
                  callback(count !== 0);
               });
           }, (results) => {
               return res.status(200).json(results);
           });
   });
});

router.delete('/:id', (req, res) => {
    Image.findByIdAndUpdate(req.params.imageid, {$pull: {'likes': req.params.id}}, (err, image) => {
       if (err) res.status(500).json({error: err});
       return res.status(200).json({status: 'Unregistered like!'});
   });
});

export default router;