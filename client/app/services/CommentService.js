'use strict';

CommentService.$inject = ['$http', 'server'];

/* @ngInject */
export default function CommentService($http, server) {
    return {
        post: (username, imageid, comment, currentUser) => $http.post(server.url + '/users/' + username + '/images/' + imageid + '/comments/', {
            author: currentUser.username,
            authorAvatar: currentUser.avatarPath,
            comment: comment
        }).then(res => res.data),
        get: (user, imageid) => $http.get(server.url + '/users/' + user.username + '/images/' + imageid).then(res => res.data),
        delete: (user, imageid, commentid) => $http.delete(server.url + '/users/' + user.username + '/images/' + imageid + '/comments/' + commentid).then(res => res)
    };
}

