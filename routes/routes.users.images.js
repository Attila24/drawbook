var express     = require('express'),
    router      = express.Router({mergeParams: true}),
    Image       = require('../db/models/image'),
    User        = require('../db/models/user'),
    mkdirp      = require('mkdirp'),
    fs          = require('fs');

router.post('/', function(req, res) {

    User.findOne({username: req.params.username}, function(err, user){
        if (err) console.log('Error' + err);

        var image = new Image({
            _author: user._id,
            title: req.body.title
        });

        var date = new Date();
        var path = 'files/' + date.getFullYear() + '/' + (date.getMonth()+1);

        mkdirp(path, function (err) {
            if (err) console.log('Error: ' + err);
            console.log('Directories created!');
        });

        var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(path+'/' + image._id + '.png', base64Data, 'base64', function (err) {
            if (err) console.log('Error: ' + err);
            console.log('File saved!');
        });

        image.url = path + '/' + image._id + '.png';

        image.save(function (err) {if (err) console.log('Error: ' + err);});

        user.images.push(image);
        user.save(function (err) {if (err) console.log('Error: ' + err);});

        return res.status(200).json({
            'message': 'POST success',
            'image title': req.body.title
        })
    });
});


router.post('/avatar', function (req, res) {
    var path = req.files.file.path.replace('app\\', '');
    path = path.replace(/\\/g, '/');
    console.log('Path: ' + path);
    console.log('username: ' + req.params.username);
    User.findOneAndUpdate({username: req.params.username}, {$set: {avatarPath: path}}, function (err) {
        if (err) console.log('Error: ' + err);
        return res.status(200).json({status: 'Update successful! New file path: ' + req.files.file.path});
    });
});

router.get('/:id', function (req, res) {
   Image.findOne({_id: req.params.id}, function (err, image) {
        if (err) {
            console.log('Error: '  + err);
            return res.status(500).json({'Error': err});
        }

        fs.readFile(image.url, 'base64', function (err, data) {
            if (err) console.log('Error: ' + err);

            return res.status(200).json({
               'image': image,
                'data': 'data:image/png;base64,' + data
            });
        });

   });
});

router.delete('/:id', function (req, res) {
    User.findOne({username: req.params.username}, function (err, user) {
        if (err) console.log('Error: ' + err);

        user.images.pull(req.params.id);
        user.save(function (err) {
            if (err) console.log('error: ' + err);
            console.log('ObjectId Deleted!');
        });

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