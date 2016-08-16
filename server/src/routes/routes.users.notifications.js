import express from 'express';
import User from '../db/models/user';
import Notification from '../db/models/notification';

const router = express.Router({mergeParams: true});

router.get('/:id', (req, res) => {
    Notification.findById(req.params.id)
        .populate({path: 'from'})
        .exec((err, notification) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json(notification);
        });
});

router.get('/', (req, res) => {
    User.findOne({'username' : req.params.username})
        .populate({
            path: 'notifications',
            options: {sort: {'date': -1}},
            populate: {path: 'from'}
        })
        .exec((err, user) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json(user);
        })
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