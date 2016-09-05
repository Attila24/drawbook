'use strict';

HomeController.$inject = ['$auth', 'currentUser', 'UserService', 'LikeService', 'CommentService', '$q'];

/**
 * The controller responsible for handling the home screen actions.
 */
/* @ngInject */
export default function HomeController($auth, currentUser, UserService, LikeService, CommentService, $q) {
    const vm = this;

    // bindable member variables
    vm.user = currentUser;

    // bindable member functions
    vm.isAuthenticated = isAuthenticated;
    vm.loadFeed = loadFeed;
    vm.like = like;
    vm.dislike = dislike;
    vm.tooltip = tooltip;

    init();

    //////////////////////////////////////

    /**
     * Initialize controller:
     * - get the 5 latest users
     * - load feed if authenticated
     */
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

    /**
     * The function responsible for loading the current user's feed.
     */
    function loadFeed() {
        UserService.getFeed(vm.user.username, vm.loaded)
            .then(res => {
                // after loading the feed images, we load the image's comment and like data

                let promises = [];

                angular.forEach(res, item => {

                   // the promise to return the like data of the current image
                   const likesPromise = LikeService.get(item._author.username, item._id).then(data => {
                       item.likes = data;
                       item.isLiked = item.likes.find(x => x._id == vm.user._id) !== undefined;
                   });

                   // the promise to return the comment data of the current image
                   const commentsPromise = CommentService.getCount(item._author.username, item._id).then(data => {item.commentCount = data;});

                   promises.push(likesPromise, commentsPromise);
                });

                // execute all promises, then save the feed in the model
                $q.all(promises).then(() => {
                    vm.feed.push(...res);
                    vm.loaded = vm.feed.length;
                });
            });
    }

    /**
     * The function responsible for handling the 'like' action.
     * @param username the username of current user (who is liking)
     * @param id the id of the image that is liked.
     * @param index the index of current image in the feed array.
     */
    function like(username, id, index) {
        LikeService.post(username, id, vm.user)
            .then(() => {
                // current image is now liked, add current person to likes array
                vm.feed[index].isLiked = true;
                vm.feed[index].likes.unshift({_id: vm.user._id, username: vm.user.username});
            });
    }

    /**
     * The function responsible for handling the 'dislike' action.
     * @param username the username of current user (who is disliking).
     * @param id the id of the image that is disliked.
     * @param index the index of current image in the feed array.
     */
    function dislike(username, id, index) {
        LikeService.delete(username, id, vm.user._id)
            .then(() => {
                // current image is now disliked, remove current person from the likes array
                vm.feed[index].isLiked = false;
                vm.feed[index].likes.splice(
                    vm.feed[index].likes.findIndex(x => x._id == vm.user._id), 1
                )
            });
    }

    /**
     * The function responsible for showing the 'likes' tooltip for a given image.
     * @param index the index of the current image in the feed array.
     * @returns {{title: string}} an object that contains the string that is being displayed by AngularStrap.
     */
    function tooltip(index) {
        if (vm.feed[index].likes.length > 0) {

            let str = '';
            const limit = 5; // maximum number of users being shown in tooltip

            // reduce the 'likes' array to a HTML string of the last five usernames
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

    /**
     * The function to determine if the current user is authenticated.
     * @returns {*}
     */
    function isAuthenticated() {
        return $auth.isAuthenticated();
    }
}