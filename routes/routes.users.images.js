(function () {
    'use strict';

    const
        express     = require('express'),
        router      = express.Router({mergeParams: true}),
        Image       = require('../db/models/image'),
        User        = require('../db/models/user'),
        mkdirp      = require('mkdirp'),
        fs          = require('fs');


    router.post('/', function(req, res) {
        User.findOne({username: req.params.username}, function(err, user){
            if (err) return res.status(500).json({error: err});

            // Create directory
            let date = new Date();
            let path = 'files/' + date.getFullYear() + '/' + (date.getMonth() + 1);

            mkdirp(path, err => {if (err) console.log('Error while creating directory: ' + err);});

            // Save image file
            let image = new Image({
                _author: user._id,
                title: req.body.title
            });

            let base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");

            fs.writeFile(path + '/' + image._id + '.png', base64Data, 'base64', err => {
                if (err) console.log('Error: ' + err);
                console.log('File saved!');
            });

            image.url = path + '/' + image._id + '.png';
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
                    'data': 'data:image/png;base64,' + data
                });
            });
       });
    });

    router.delete('/:id', (req, res) => {
        User.findOne({username: req.params.username}, (err, user) => {
            if (err) return res.status(500).json({error: err});

            user.images.pull(req.params.id);
            user.save(err => {if (err) return res.status(500).json({error: err});});

            Image.findOneAndRemove(
                {_id: req.params.id},
                err => {if (err) return res.status(500).json({error: err});});

            return res.status(200).json({status: 'Successfully deleted picture'});
        })
    });

    module.exports = router;

})();
