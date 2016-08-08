'use strict';

import express from 'express';
import Image from '../db/models/image';

const router = express.Router({mergeParams: true});

router.post('/', (req, res) => {
    Image.findOne({_id: req.params.imageid}, (err, image) => {

        image.likes.push(req.body.author);
        image.save(err => {if (err) res.status(500).json({error: err});});
        console.log('Registered like!');
        console.log(image.likes);
        return res.status(200).json({status: 'Registered like!'});
    });
});

router.get('/', (req, res) => {
   Image.findOne({_id: req.params.imageid}, (err, image) => {
       if (err) return res.status(500).json({error: err});

       return res.status(200).json({likes: image.likes});
   });
});

router.delete('/:author', (req, res) => {
   Image.findOne({_id: req.params.imageid}, (err, image) => {

       image.likes.pull(req.params.author);
       image.save(err => {if (err) res.status(500).json({error: err});});

       console.log('Unregistered like!');
       console.log(image.likes);
       return res.status(200).json({status: 'Unregistered like!'});
   });
});

export default router;