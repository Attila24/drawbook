import User from './models/user';

/**
 * Updates an user's socket id.
 * @param id the user's id
 * @param socketid the new socket id
 */
function setSocket(id, socketid) {
    User.findByIdAndUpdate(id, {socketid: socketid}, err => {if (err) console.log('Error: ' + err);});
}

/**
 * Returns the socket id of an user.
 * @param id the user's id
 * @returns {Promise} a promise that will be resolved when the user is found in the database.
 */
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