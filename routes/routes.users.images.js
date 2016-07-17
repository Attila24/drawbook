var express = require('express'),
    router  = express.Router({mergeParams: true}),
    Image   = require('../db/models/image'),
    User    = require('../db/models/user');

router.post('/', function(req, res) {

    User.findOne({username: req.params.username}, function(err, user){
        if (err) console.log('Error' + err);

        var image = new Image({
            _author: user._id,
            title: req.body.title
        });

        image.save(function (err) {
            if (err) console.log('Error: ' + err);
        });

        user.images.push(image);
        user.save(function (err) {
            if (err) console.log('Error: ' + err);
        });

        return res.status(200).json({
            'message': 'POST success',
            'image title': req.body.title
        })
    });
});

router.delete('/:id', function (req, res) {
    User.findOne({username: req.params.username}, function (err, user) {
        if (err) console.log('Error: ' + err);

        //user.images.pull({_id: req.params.id});
        user.images.pull(req.params.id);

        Image.findOneAndRemove({_id: req.params.id}, function (err, image) {
            console.log('Image deleted: ' + image._id);
        });

        return res.status(200).json({
            'message': 'DELETE success',
            'image id': req.params.id
        });
    })

});

module.exports = router;