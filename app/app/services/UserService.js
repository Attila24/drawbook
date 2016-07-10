(function () {
    'use strict';

    UserService.$inject = ['$q', '$http', 'server'];

    /* @ngInject */
    function UserService($q, $http, server) {

        return {
            get: function (username) {
                var deferred = $q.defer();
                $http.get(server.url + 'users/' + username)
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

    module.exports = UserService;

})();
