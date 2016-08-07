'use strict';

CommentService.$inject = ['$q', '$http', 'server'];

/* @ngInject */
export default function CommentService($q, $http, server) {
    return {
        post: (username, imageid, comment, currentUser) => {
            let deferred = $q.defer();

            $http.post(server.url + '/users/' + username + '/images/' + imageid + '/comments/',
                {
                    author: currentUser.username,
                    authorAvatar: currentUser.avatarPath,
                    comment: comment
                })
                .success(data => {deferred.resolve(data);})
                .error(data => {deferred.reject(data);});

            return deferred.promise;
        },
        get: (user, imageid) => {
            let deferred = $q.defer();

            $http.get(server.url + '/users/' + user.username + '/images/' + imageid)
                .success(data => {deferred.resolve(data);})
                .error(data => {deferred.reject(data);});
            return deferred.promise;
        }
    };
}

