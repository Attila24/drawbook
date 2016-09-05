import express from 'express';
import User from '../db/models/user';

const router = express.Router({mergeParams: true});

router.get('', (req, res) => {
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
});

router.post('', (req, res) => {

    User.findOneAndUpdate({username: req.params.username}, {$push: {'followers': req.body.who}}, (err, user) => {
        if (err) return res.status(500).json({error: err});

        User.findByIdAndUpdate(req.body.who, {$push: {'feed': {$each: user.images}, 'following': user._id}}, (err, user) => {
            if (err) return res.status(500).json({error: err});
            else return res.status(200).json({messages: [{'text': 'Followed!', 'severity': 'info'}]});
        });
    });
});

router.delete('/:id', (req, res) => {

    User.findOneAndUpdate({username: req.params.username}, {$pull: {'followers': req.params.id}}, (err, user) => {
        if (err) return res.status(500).json({error: err});

        User.findByIdAndUpdate(req.params.id, {$pullAll: {'feed': user.images}}, (err, who) => {
            if (err) return res.status(500).json({error: err});

            who.following.pull(user._id);
            who.save(err => {if (err) console.log('Error: ' + err);});

            return res.status(200).json({messages: [{'text': 'Unfollowed!', 'severity': 'info'}]});
        });

    });
});

export default router;