import express from 'express';
import User from '../models/user';

const router = express.Router({mergeParams: true});

router.route('')
// Get the last 10 followers, skip given amount of followers
    .get((req, res) => {
        User.findOne({username: req.params.username})
            .populate({
                path: 'followers',
                options: {
                    limit: 10,
                    skip: parseInt(req.query.skip)
                }
            })
            .select('followers')
            .exec((err, data) => {
                if (err) return res.status(500).json({error: err});
                return res.status(200).json(data.followers);
            });
    })
    // Add a new follower to a user
    .post((req, res) => {

        // Add new follower
        User.findOneAndUpdate({username: req.params.username}, {$push: {'followers': req.body.who}}, (err, user) => {
            if (err) return res.status(500).json({error: err});

            // Add new followed user to followings
            User.findByIdAndUpdate(req.body.who, {$push: {'feed': {$each: user.images}, 'following': user._id}}, (err, user) => {
                if (err) return res.status(500).json({error: err});
                else return res.status(200).json({messages: [{'text': 'Followed!', 'severity': 'info'}]});
            });
        });
});

router.route('/:id')
    // Remove a follower from a user
    .delete((req, res) => {

        // Remove follower
        User.findOneAndUpdate({username: req.params.username}, {$pull: {'followers': req.params.id}}, (err, user) => {
            if (err) return res.status(500).json({error: err});

            // Remove all feed items from the previously followed user
            User.findByIdAndUpdate(req.params.id, {$pullAll: {'feed': user.images}}, (err, who) => {
                if (err) return res.status(500).json({error: err});

                // Remove previously followed user from followings
                who.following.pull(user._id);
                who.save(err => {if (err) console.log('Error: ' + err);});

                return res.status(200).json({messages: [{'text': 'Unfollowed!', 'severity': 'info'}]});
            });
        });
});

export default router;