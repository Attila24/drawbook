(function () {
    'use strict';

    AuthService.$inject = ['$q', '$timeout', '$http', 'server'];

    /* @ngInject */
    function AuthService($q, $timeout, $http, server) {

        var user = null;

        var service = {
            isLoggedIn: isLoggedIn,
            login: login,
            logout: logout,
            register: register
        };

        return service;

        function isLoggedIn() {
            if (user) return true;
            else return false;
        }


        function login(username, password) {

            var deferred = $q.defer();

            $http.post(server.url + 'users/login', {username: username, password: password})
                .success(function(data, status) {
                    if (status === 200 && data.status) {
                        user = true;
                        deferred.resolve();
                    } else {
                        user = false;
                        deferred.reject();
                    }
                })
                .error(function(data) {
                    user = false;
                    deferred.reject();
                });

            return deferred.promise;
        }

        function logout() {

            var deferred = $q.defer();

            $http.get(server.url + 'users/logout')
                .success(function (data) {
                    user = false;
                    deferred.resolve();
                })
                .error(function (data) {
                    user = false;
                    deferred.reject();
                });

            return deferred.promise;
        }

        function register(username, password) {

            var deferred = $q.defer();

            $http.post(server.url + 'users/register', {username: username, password: password})
                .success(function(data, status) {
                    if (status === 200 && data.status) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                })
                .error(function(data) {
                   deferred.reject();
                });

            return deferred.promise;
        }
    }

    module.exports = AuthService;

})();
