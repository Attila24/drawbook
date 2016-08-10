'use strict';

LikeService.$inject = ['$q', '$http', 'server'];

/* @ngInject */
export default function LikeService($q, $http, server) {
    return {
        post: (username, id, user) => $http.post(server.url + '/users/' + username + '/images/' + id + '/likes/', {author: user.username, authorTimestamp: user.timestamp}).then(res => res),
        get: (username, id) => $http.get(server.url + '/users/' + username + '/images/' + id + '/likes/').then(res => res.data),
        delete: (username, id, likeid) => $http.delete(server.url + '/users/' + username + '/images/' + id + '/likes/' + likeid).then(res => res)
    }
}
