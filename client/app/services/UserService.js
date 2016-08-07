'use strict';

UserService.$inject = ['$q', '$http', 'server'];

/* @ngInject */
export default function UserService($q, $http, server) {
    return {
        get: function (username) {
            var deferred = $q.defer();
            var url = username ? server.url + 'users/' + username : server.url + 'users/';
            $http.get(url)
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject('rejected: ' + data);
                });

            return deferred.promise;
        },
        update: function(user) {
            var deferred = $q.defer;
            $http.patch(server.url + 'users/' + user.username, {user: user})
                .success(function (data) {

                })
                .error(function (data) {
                    deferred.reject('rejected: ' + data);
                });
            return deferred.promise;
        }
    };
}
