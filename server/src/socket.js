import User from './db/models/user';
import Notification from './db/models/notification';

function setSocket(id, socketid) {
    User.findOneAndUpdate({_id: id}, {socketid: socketid}, (err, user) => {
       if (err) console.log('Error: ' + err);
    });
}

function getSocket(id) {
    return new Promise((resolve, reject) => {
        User.findOne({_id: id}, 'username socketid', (err, data) => {
            if (err) reject(err);
            resolve({socketid: data.socketid, username: data.username});
        })
    });
}

function saveNotification(from, to, type, imageid, comment) {

    let notification = new Notification({
        from: from,
        to: to,
        type: type,
        imageid: imageid,
        comment: comment
    });

    console.log(notification);

    notification.save(err => {if (err) console.log('Error: ' + err)});

    User.findByIdAndUpdate(to, {$push: {'notifications': notification}}, (err, user) => {
        if (err) console.log('Error: ' + err);
    });
}

export {
    setSocket,
    getSocket,
    saveNotification
}