'use strict';

HomeController.$inject = ['$auth', 'currentUser', 'UserService', 'LikeService', 'CommentService', '$q'];

/* @ngInject */
export default function HomeController($auth, currentUser, UserService, LikeService, CommentService, $q) {
    const vm = this;
    vm.title = 'HomeController';
    vm.user = currentUser;

    vm.isAuthenticated = isAuthenticated;
    vm.loadFeed = loadFeed;
    vm.like = like;
    vm.dislike = dislike;
    vm.tooltip = tooltip;

    const limit = 10;

    init();

    ////////////////////////////////////////////

    function init() {
        UserService.getMany(0, 5)
            .then(res => {
                vm.users = res;
            });

        if (isAuthenticated()) {
            vm.feed = [];
            vm.loaded = 0;

            loadFeed();
        }
    }

    function loadFeed() {
        UserService.getFeed(vm.user.username, vm.loaded)
            .then(res => {

                let promises = [];

                angular.forEach(res, item => {
                   const likesPromise = LikeService.get(item._author.username, item._id).then(data => {
                       item.likes = data;
                       item.isLiked = item.likes.find(x => x._id == vm.user._id) !== undefined;
                   });
                   const commentsPromise = CommentService.getCount(item._author.username, item._id).then(data => {item.commentCount = data;});

                   promises.push(likesPromise, commentsPromise);
                });

                $q.all(promises).then(() => {
                    vm.feed.push(...res);
                    vm.loaded = vm.feed.length;
                });
            });
    }

    function like(username, id, index) {
        LikeService.post(username, id, vm.user)
            .then(res => {
                vm.feed[index].isLiked = true;
                vm.feed[index].likes.unshift({_id: vm.user._id, username: vm.user.username});
            });
    }

    function dislike(username, id, index) {
        LikeService.delete(username, id, vm.user._id)
            .then(res => {
                console.log(index);
                vm.feed[index].isLiked = false;
                vm.feed[index].likes.splice(
                    vm.feed[index].likes.findIndex(x => x._id == vm.user._id), 1
                )
            });
    }

    function tooltip(index) {
        if (vm.feed[index].likes.length > 0) {

            let str = '';
            const limit = 5;

            if (vm.feed[index].likes.length <= limit) {
                str = vm.feed[index].likes
                    .map(x => x.username)
                    .reduce((prev, curr) => prev + "<br />" + curr);
            } else {
                str = vm.feed[index].likes.slice(0, limit)
                    .map(x => x.username)
                    .reduce((prev, curr) => prev + "<br />" + curr);

                str += "<br />" + (vm.feed[index].likes.length - limit) + " more";
            }

            return {
                title: str
            }
        }
    }

    function isAuthenticated() {
        return $auth.isAuthenticated();
    }
}


