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
        getMany: (username, skip, limit) => $http({url: server.url + 'users/' + username + '/images', method: 'GET', params: {skip: skip, limit: limit}}).then(res => res.data),
        post: (username, img, title) => $http.post(server.url + 'users/' + username + '/images/', {
            "title": title,
            "image": img
        }).then(res => res.data),
        updateTitle: (username, id, title) => $http.patch(server.url + 'users/' + username + '/images/' + id + '/title', {title: title}).then(res => res.data),
        delete: (id, username) => $http.delete(server.url + 'users/' + username + '/images/' + id).then(res => res.data)
    };
}
