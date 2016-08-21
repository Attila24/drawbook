'use strict';

LikeService.$inject = ['$http', 'server'];

/* @ngInject */
export default function LikeService($http, server) {
    return {
        post: (username, id, author) => $http.post(server.url + '/users/' + username + '/images/' + id + '/likes/', {authorId: author._id}).then(res => res),
        get: (username, id) => $http.get(server.url + '/users/' + username + '/images/' + id + '/likes/').then(res => res.data),
        delete: (username, id, likeid) => $http.delete(server.url + '/users/' + username + '/images/' + id + '/likes/' + likeid).then(res => res)
    }
}
