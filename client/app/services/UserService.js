'use strict';

UserService.$inject = ['$http', 'server'];

/* @ngInject */
export default function UserService($http, server) {
    return {
        get: (username) => {
            var url = username ? server.url + 'users/' + username : server.url + 'users/';
            return $http.get(url).then(res => res.data);
        },
        update: (user) => $http.patch(server.url + 'users/' + user.username, {user: user}).then(res => res.data),
        delete: (user) => $http.delete(server.url + 'users/' + user.username).then(res => res),
        getAvatarPath: (username) => $http.get(server.url  + 'users/' + username + '/images/avatar').then(res => res.data),
        getTimestamp: (username) => $http.get(server.url + 'users/' + username + '/timestamp').then(res => res.data[0])
    };
}
