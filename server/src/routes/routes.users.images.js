'use strict';

import express from 'express';
import fs from 'fs';
import Image from '../db/models/image';
import User from '../db/models/user';
import {ensureAuthenticated} from './auth';

const router = express.Router({mergeParams: true});

router.post('/', (req, res) => {
    User.findOne({username: req.params.username}, (err, user) => {
        if (err) return res.status(500).json({error: err});

        // Save image file
        const image = new Image({
            _author: user._id,
            title: req.body.title
        });

        const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(`server/files/${image._id}.png`, base64Data, 'base64', err => {
            if (err) console.log(`Error: ${err}`);
            console.log(`Image '${image._id}.png' saved`);
        });

        image.url = `server/files/${image._id}.png`;
        image.save(err => {if (err) return res.status(500).json({error: err});});

        // Save to user
        user.images.push(image);
        user.save(err => {if (err) return res.status(500).json({error: err});});

        return res.status(200).json({status: 'Successfully saved image'})
    });
});

router.post('/avatar', (req, res) => {
    let path = req.files.file.path.replace('app\\', '');
    path = path.replace(/\\/g, '/');
    User.findOneAndUpdate({username: req.params.username}, {$set: {avatarPath: path}}, err => {
        if (err) return res.status(500).json({error: err});
        return res.status(200).json({status: 'Successfully saved avatar'});
    });
});

router.get('/:id', (req, res) => {
    Image.findOne({_id: req.params.id}, (err, image) => {
        if (err) return res.status(500).json({error: err});

        fs.readFile(image.url, 'base64', (err, data) => {
            if (err) return res.status(500).json({error: err});

            return res.status(200).json({
                'image': image,
                'data': `data:image/png;base64,${data}`
            });
        });
    });
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
    User.findOne({username: req.params.username}, (err, user) => {
        if (err) return res.status(500).json({error: err});

        user.images.pull(req.params.id);
        user.save(err => {if (err) return res.status(500).json({error: err});});

        Image.findOneAndRemove(
            {_id: req.params.id},
            err => {if (err) return res.status(500).json({error: err});});

        fs.unlink(`server/files/${req.params.id}.png`, (err) => {
           if (err) throw err;
           console.log(`Successfully deleted image file ${req.params.id}.png`);
        });

        return res.status(200).json({status: 'Successfully deleted picture'});
    });
});


export default router;
