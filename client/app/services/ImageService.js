'use strict';

ImageService.$inject = ['$http', 'server'];

/* @ngInject */
export default function ImageService($http, server) {
    return {
        get: (username, id) => $http({
            method: 'GET',
            url: server.url + 'users/' + username + '/images/' + id,
            headers: {'Content-Type': 'images/png'}
        }).then(res => ({data: res, id: id})),

        post: (username, img, title) => $http.post(server.url + 'users/' + username + '/images/', {
            "title": title,
            "image": img
        }).then(res => res.data),

        delete: (id, username) => $http.delete(server.url + 'users/' + username + '/images/' + id).then(res => res.data)
    };
}
