'use strict';

LikeService.$inject = ['$q', '$http', 'server'];

/* @ngInject */
export default function LikeService($q, $http, server) {
    return {
        post: (username, id, author) => $http.post(server.url + '/users/' + username + '/images/' + id + '/likes/', {author: author}).then(res => res),
        get: (username, id) => $http.get(server.url + '/users/' + username + '/images/' + id + '/likes/').then(res => res),
        delete: (username, id, author) => $http.delete(server.url + '/users/' + username + '/images/' + id + '/likes/' + author).then(res => res)
    }
}
