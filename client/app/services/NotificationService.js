'use strict';

NotificationService.$inject = ['$http', 'server'];

/* @ngInject */
export default function NotificationService($http, server) {
    return {
        get: (username, skip) => $http({url: server.url + 'users/' + username + '/notifications', method: 'GET', params: {skip: skip}}).then(res => res.data),
        getCount: (username) => $http({url: server.url + 'users/' + username + '/notifications/count', method: 'GET'}).then(res => res.data)
    }
}