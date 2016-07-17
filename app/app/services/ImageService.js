(function () {
    'use strict';

    ImageService.$inject = ['$q', '$http', 'server'];

    /* @ngInject */
    function ImageService($q, $http, server) {

        return {
            post: function (username) {
                var deferred = $q.defer();
                $http.post(server.url + '/users/' + username + '/images/', {
                        "title": "teszt kep"
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
                $http.delete(server.url + '/users/' + username + '/images/' + id)
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
