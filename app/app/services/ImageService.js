(function () {
    'use strict';

    ImageService.$inject = ['$q', '$http', 'server'];

    /* @ngInject */
    function ImageService($q, $http, server) {

        return {
            get: function (username, id) {

                var deferred = $q.defer();
                $http({
                        method: 'GET',
                        url: server.url + 'users/' + username + '/images/' + id,
                        headers: {'Content-Type': 'images/png'}
                    })
                    .then(function (data) {
                        deferred.resolve(data);
                    }, function (data) {
                        deferred.reject(data);
                    });

                return deferred.promise;
            },
            post: function (username, img) {
                var deferred = $q.defer();
                $http.post(server.url + 'users/' + username + '/images/', {
                        "title": "teszt kep",
                        "image": img
                    })
                    .success(function (data) {
                        deferred.resolve(data);
                    })
                    .error(function (data) {
                        deferred.reject('rejected: ' + data);
                    });
                return deferred.promise;
            },
            delete: function (id, username) {
                var deferred = $q.defer();
                $http.delete(server.url + 'users/' + username + '/images/' + id)
                    .success(function (data) {
                        deferred.resolve(data);
                    })
                    .error(function (data) {
                        deferred.reject('rejected: ' + data);
                    });
                return deferred.promise;
            }
        };
    }
    module.exports = ImageService;

})();
