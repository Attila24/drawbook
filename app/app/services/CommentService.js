(function () {
    'use strict';

    CommentService.$inject = ['$q', '$http', 'server'];

    /* @ngInject */
    function CommentService($q, $http, server) {

        return {
            post: function (username, imageid, comment, currentUser) {

                var deferred = $q.defer();

                $http.post(
                    server.url + '/users/' + username + '/images/' + imageid + '/comments/', {
                        author: currentUser.username,
                        authorAvatar: currentUser.avatarPath,
                        comment: comment
                    })
                    .success(function (data) {
                        deferred.resolve(data);
                    })
                    .error(function (data) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            },
            get: function (user, imageid) {
                var deferred = $q.defer();

                $http.get(server.url + '/users/' + user.username + '/images/' + imageid)
                    .success(function (data) {
                        deferred.resolve(data);
                    })
                    .error(function (data) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            }
        };
    }
    module.exports = CommentService;

})();
