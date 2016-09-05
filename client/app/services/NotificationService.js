'use strict';

NotificationService.$inject = ['$http', 'server'];

/* @ngInject */
export default function NotificationService($http, server) {
    return {
        get: (username, skip) => $http({url: server.url + 'users/' + username + '/notifications', method: 'GET', params: {skip: skip}}).then(res => res.data),
        getCount: (user) => $http({url: server.url + 'users/' + user.username + '/notifications/count', method: 'GET', params: {userid: user._id}}).then(res => res.data)
    }
}