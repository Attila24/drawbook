'use strict';

UserService.$inject = ['$http', 'server'];

/* @ngInject */
export default function UserService($http, server) {
    return {
        get: (username) => $http.get(server.url + 'users/' + username).then(res => res.data),
        getMany: (skip, limit, search = undefined) => $http({url: server.url + 'users/', method: 'GET', params: {limit: limit, skip: skip, search: search}}).then(res => res.data),
        update: (user) => $http.patch(server.url + 'users/' + user.username, {user: user}).then(res => res.data),
        delete: (user) => $http.delete(server.url + 'users/' + user.username).then(res => res),
        getAvatarPath: (username) => $http.get(server.url  + 'users/' + username + '/images/avatar').then(res => res.data),
        follow: (who, whom) => $http.post(server.url + 'users/' + whom.username + '/followers', {who: who._id}).then(res => res),
        unfollow: (who, whom) => $http.delete(server.url + 'users/' + whom.username + '/followers/' + who._id).then(res => res),
        getFeed: (username, skip) => $http({url: server.url + 'users/' + username + '/feed', method: 'GET', params: {skip: skip}}).then(res => res.data),
        getFollowers: (username, skip) => $http({url: server.url + 'users/' + username + '/followers', method: 'GET', params: {skip: skip}}).then(res => res.data),
        getFollowing: (username, skip) => $http({url: server.url + 'users/' + username + '/following', method: 'GET', params: {skip: skip}}).then(res => res.data),
        getCount: () => $http.get(server.url + '/users/count').then(res => res.data)
    };
}
