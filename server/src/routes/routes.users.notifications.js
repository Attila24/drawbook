import express from 'express';
import async from 'async';
import User from '../db/models/user';
import Notification from '../db/models/notification';

const router = express.Router({mergeParams: true});

router.get('', (req, res) => {
    User.findOne({'username' : req.params.username})
        .populate({
            path: 'notifications',
            options: {
                sort: {'date': -1},
                limit: 5,
                skip: parseInt(req.query.skip)
            },
            populate: {path: 'from'}
        })
        .select('notifications')
        .exec((err, data) => {
            if (err) return res.status(500).json({error: err});

            async.filter(data.notifications, (notification, callback) => {
                User.count({_id: notification.from}, (err, count) => {
                    if (err) console.log('Error: ' + err);
                    callback(count !== 0);
                });
            }, (results) => {
                return res.status(200).json(results);
            });
        });
});

router.get('/count', (req, res) => {
   Notification.find({to: req.query.userid})
       .select('to')
       .exec((err, data) => {
           if (err) res.status(500).json({error: err});

           async.filter(data, (notification, callback) => {
              User.count({_id: notification.to}, (err, count) => {
                  if (err) console.log('Error: ' + err);
                  callback(count !== 0);
              });
           }, results => {
               return res.status(200).json(results.length);
           });
       });
});

function saveNotification(from, to, type, imageid, comment) {

    const notification = new Notification({
        from: from,
        to: to,
        type: type,
        imageid: imageid,
        comment: comment
    });

    notification.save(err => {if (err) console.log('Error: ' + err)});

    User.findByIdAndUpdate(to, {$push: {'notifications': notification}}, err => {if (err) console.log('Error: ' + err);});
}

export default router;

export {saveNotification}