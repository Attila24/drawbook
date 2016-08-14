'use strict';

import express from 'express';
import Image from '../db/models/image';

const router = express.Router({mergeParams: true});

router.post('/', (req, res) => {
    Image.findOne({_id: req.params.imageid}, (err, image) => {
        image.likes.push({'author': req.body.author, 'authorTimestamp': req.body.authorTimestamp});
        image.save(err => {if (err) res.status(500).json({error: err});});
        console.log('Registered like by ' + req.body.author);
        return res.status(200).json({status: 'Registered like!'});
    });
});

router.get('/', (req, res) => {
   Image.findOne({_id: req.params.imageid}, (err, image) => {
       if (err) return res.status(500).json({error: err});
       else if (image == null) return res.status(404).json({message: 'Not found'});
       else return res.status(200).json({likes: image.likes});
   });
});

router.delete('/:id', (req, res) => {
   Image.findOne({_id: req.params.imageid}, (err, image) => {
       image.likes.pull(req.params.id);
       image.save(err => {
           if (err) {
               console.log('Error: ' + err);
               return res.status(500);
           } else {
               return res.status(200).json({status: 'Unregistered like!'});
           }
       });
   });
});

export default router;