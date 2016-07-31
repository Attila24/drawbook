var express         = require('express'),
    router          = express.Router({mergeParams: true}),
    CommentSchema   = require('../db/models/comment'),
    Image           = require('../db/models/image'),
    mongoose        = require('mongoose');

router.post('/', function(req, res) {

    Image.findOne({_id: req.params.imageid}, function (err, image) {
        if (err) console.log('Error' + err);

            var Comment = mongoose.model('Comment', CommentSchema);

            var comment = new Comment({
                author: req.body.author,
                authorAvatar: req.body.authorAvatar,
                text: req.body.comment
            });

            image.comments.push(comment);
            image.save(function (err) {
                if (err) {
                    console.log('Error: ' + err);
                }
            });

            return res.status(200).json({
                'message': 'POST Success'
            });
    });
});

router.get('/:id', function (req, res) {
   Image.findOne({_id: req.params.imageid}, function (err, image) {
        if (err) console.log(err);

        return res.status(200).json({
            comments: image.comments
        });
   });
});

module.exports = router;



