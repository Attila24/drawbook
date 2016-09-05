import express from 'express';
import async from 'async';
import User from '../models/user';
import Notification from '../models/notification';

const router = express.Router({mergeParams: true});

// Get notifications of a user (limited amount, skip already loaded notifications)
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

            // Filter out the notifications where the 'from' user has been removed
            async.filter(data.notifications, (notification, callback) => {
                User.count({_id: notification.from}, (err, count) => {
                    if (err) console.log('Error: ' + err);
                    callback(count !== 0);
                });
            }, (results) => {
                // When all done, send to user
                return res.status(200).json(results);
            });
        });
});

// Return the total amount of notifications of an user
router.get('/count', (req, res) => {
   Notification.find({to: req.query.userid})
       .select('to')
       .exec((err, data) => {
           if (err) res.status(500).json({error: err});

           // Filter out the notifications where the user has been removed
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

/**
 * Save a new notification in the DB.
 * @param from the user's id who sent the notification
 * @param to the user's id who will receive the notification
 * @param type the type of the notification
 * @param imageid the id of the image related to the notification
 * @param comment the text of the new comment
 */
function saveNotification(from, to, type, imageid, comment) {

    const notification = new Notification({
        from: from,
        to: to,
        type: type,
        imageid: imageid,
        comment: comment
    });

    notification.save(err => {if (err) console.log('Error: ' + err)});

    // Save to the user's notifications array
    User.findByIdAndUpdate(to, {$push: {'notifications': notification}}, err => {if (err) console.log('Error: ' + err);});
}

export default router;

export {saveNotification}