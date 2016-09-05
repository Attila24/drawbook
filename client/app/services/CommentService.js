'use strict';

CommentService.$inject = ['$http', 'server'];

/**
 * The service responsible for handling requests related to comments.
 */
/* @ngInject */
export default function CommentService($http, server) {
    return {
        post: (username, imageid, comment, currentUser) => $http.post(server.url + '/users/' + username + '/images/' + imageid + '/comments/', {
            authorId: currentUser._id,
            authorUsername: currentUser.username,
            authorAvatarPath: currentUser.avatarPath,
            comment: comment
        }).then(res => res.data),
        get: (user, imageid, skip, limit) => $http({url: server.url + 'users/' + user.username + '/images/' + imageid + '/comments', method: 'GET', params: {skip: skip, limit: limit}}).then(res => res.data),
        delete: (user, imageid, commentid) => $http.delete(server.url + 'users/' + user.username + '/images/' + imageid + '/comments/' + commentid).then(res => res),
        getCount: (user, imageid) => $http({url: server.url + 'users/' + user.username + '/images/' + imageid + '/comments/count'}).then(res => res.data)
    };
}