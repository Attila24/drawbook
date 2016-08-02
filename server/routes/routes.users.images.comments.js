((() => {
    'use strict';

    const
        express = require('express'),
        router = express.Router({mergeParams: true}),
        CommentSchema = require('../db/models/comment'),
        Image = require('../db/models/image'),
        mongoose = require('mongoose');

    router.post('/', (req, res) => {
        Image.findOne({_id: req.params.imageid}, (err, image) => {
            if (err) return res.status(500).json({error: err});

            const Comment = mongoose.model('Comment', CommentSchema);
            const comment = new Comment({
                author: req.body.author,
                authorAvatar: req.body.authorAvatar,
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

    module.exports = router;
}))();



