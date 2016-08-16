import User from './db/models/user';
import Notification from './db/models/notification';

function setSocket(id, socketid) {
    User.findByIdAndUpdate(id, {socketid: socketid}, err => {if (err) console.log('Error: ' + err);});
}

function getSocket(id) {
    return new Promise((resolve, reject) => {
        User.findById(id, 'username socketid', (err, data) => {
            if (err) reject(err);
            resolve({socketid: data.socketid, username: data.username});
        })
    });
}

export {
    setSocket,
    getSocket
}