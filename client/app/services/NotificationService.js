'use strict';

NotificationService.$inject = ['$http', 'server'];

/* @ngInject */
export default function NotificationService($http, server) {
    return {
        get: (username, id) => $http.get(server.url + 'users/' + username + '/notifications/' + id).then(res => res.data)
    }
}