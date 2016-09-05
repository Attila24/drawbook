'use strict';

UserImageController.$inject = ['$stateParams', 'ImageService', 'user', '$state', '$scope', 'CommentService', 'localStorageService', 'LikeService', '$q', 'UserService', 'socket', '$auth'];

/**
 * The controller responsible for handling the actions on the image page.
 */
/* @ngInject */
export default function UserImageController($stateParams, ImageService, user, $state, $scope, CommentService, localStorageService, LikeService, $q, UserService, socket, $auth) {
    const vm = this;

    // bindable member variables
    vm.user = user.user;
    vm.index = $stateParams.index;
    vm.likes = [];
    vm.comments = [];

    // bindable member functions
    vm.navigate = navigate;
    vm.loadComments = loadComments;
    vm.addComment = addComment;
    vm.deleteComment = deleteComment;
    vm.like = like;
    vm.dislike = dislike;
    vm.init = init;
    vm.isAuthenticated = isAuthenticated;
    vm.hide = hide;
    vm.updateImageTitle = updateImageTitle;

    //////////////////////////////////////

    /**
     * Initialize controller:
     * - initialize values
     * - load likes of image
     * - determine IDs of previous and next image
     * - load image itself
     * - load comments of image
     */
    function init() {

        // init values
        vm.isLiked = false;
        vm.currentUser = localStorageService.get('currentUser');
        vm.loadedComments = 0;
        vm.commentLimit = 10;

        // load likes, determine if current image is liked
        loadLikes().then(result => {vm.isLiked = result;});

        // (jQuery) close modal if click is outside
        $(window).on('click', function(event) {
            if ($(event.target).is('.modal')) {
                $state.go('user.gallery', {user: vm.username})
                    .then(() => {
                        $scope.$hide();
                    });
            }
        });

        // determine index of current image in gallery
        if (vm.index === undefined || vm.index === null) {
            vm.index = vm.user.images.map(e => e._id).indexOf($stateParams.id);
        }

        // determine IDs of previous and next images in gallery
        if (vm.user.images.length == 1) {
            vm.prev = vm.next = undefined;
        } else if (vm.index === 0) {
            vm.next = vm.user.images[vm.index+1]._id;
            vm.prev = undefined;
        } else if (vm.index > 0 && vm.index < vm.user.images.length-1) {
            vm.prev = vm.user.images[vm.index-1]._id;
            vm.next = vm.user.images[vm.index+1]._id;
        } else if (vm.index == vm.user.images.length-1) {
            vm.prev = vm.user.images[vm.index-1]._id;
            vm.next = undefined;
        }

        // load image, then load comments
        ImageService.get(vm.user.username, $stateParams.id, true)
            .then(res => {
                // if not found, go to 404 page
                if (res.data.status == 500 || res.data.status == 404){
                    $state.go('404');
                    $scope.$hide();
                }
                vm.image = res.data.data;
                loadComments();
            });

        // load total comment count on image
        loadCommentCount();
    }

    // Comments --------------------------

    /**
     * The function responsible for loading the total amount of comments on the image
     */
    function loadCommentCount() {
        CommentService.getCount(vm.user.username, $stateParams.id)
            .then(res => {
                vm.allComments = res;
            });
    }

    /**
     * Initiates loading comment texts, then comment avatars.
     */
    function loadComments() {
        loadCommentTexts().then(amount => {loadCommentAvatars(amount)});
    }

    /**
     * Loads comment texts of an image
     * @returns {promise|e.promise|*|d} a promise that is resolved when all the comment texts finished loading.
     */
    function loadCommentTexts() {
        let d = $q.defer();

        CommentService.get(vm.user.username, $stateParams.id, vm.loadedComments, vm.commentLimit)
            .then(res => {
                let original_length = vm.comments.length;
                vm.comments.unshift(...res.reverse()); // push new comments to the beginning of the array
                vm.loadedComments = vm.comments.length;
                d.resolve(vm.loadedComments - original_length); // amount of new comments loaded
            });
        return d.promise;
    }

    /**
     * Loads user avatars and saves it in a bindable member variable (vm.comments).
     * @param amount the amount of new user avatars that need to be loaded.
     */
    function loadCommentAvatars(amount) {
        for (let i = 0; i < amount; i++) {
            UserService.getAvatarPath(vm.comments[i].authorUsername)
                .then(res => {
                    vm.comments[i].authorAvatarPath = res.avatarPath;
                });
        }
    }

    /**
     * The function responsible for sending an 'add comment' request to the server and adding a new comment to the local array.
     */
    function addComment() {
        CommentService.post(vm.user.username, $stateParams.id, vm.comment, vm.currentUser)
            .then(comment => {

                // set variables
                vm.loadedComments = 0;
                vm.commentLimit = vm.comments.length + 1;
                vm.allComments++;
                vm.comments = [];

                loadComments();

                // send new comemnt notification to the given user
                if (vm.user._id != vm.currentUser._id) {
                    socket.emit('notification', {'to': vm.user._id, 'from': vm.currentUser._id, 'author': vm.currentUser.username, 'type': 'comment', imageid: $stateParams.id, 'comment': vm.comment});
                }
                vm.comment = "";
            });
    }

    /**
     * The function responsible for sending a 'delete comment' request to the server and removing the given comment from the local array.
     * @param commentid the id of the comment that will be deleted.
     */
    function deleteComment(commentid) {
        CommentService.delete(vm.user.username, $stateParams.id, commentid)
            .then(() => {

                // set variables
                vm.loadedComments = 0;
                vm.commentLimit = vm.comments.length - 1;
                vm.allComments--;
                vm.comments = [];

                loadComments();
            });
    }

    // Likes --------------------------

    /**
     * Loads likes data of an image.
     * @returns {promise|e.promise|*|d}
     */
    function loadLikes() {
        let d = $q.defer();
        LikeService.get(vm.user.username, $stateParams.id)
            .then(data => {
                vm.likes = data;
                d.resolve(isLiked()); // determine if current image is liked by current user
            });
        return d.promise;
    }

    /**
     * The function responsible for sending an 'add like' request to the server.
     */
    function like() {
        LikeService.post(vm.user.username, $stateParams.id, vm.currentUser)
            .then(() => {
                loadLikes();
                vm.isLiked = true;

                // send notification to the given user
                if (vm.user._id != vm.currentUser._id) {
                    socket.emit('notification', {'to': vm.user._id, 'from': vm.currentUser._id, 'author': vm.currentUser.username, 'type': 'like', imageid: $stateParams.id});
                }
            });
    }

    /**
     * The function responsible for sending a 'remove like' request to the server.
     */
    function dislike() {
        LikeService.delete(vm.user.username, $stateParams.id, vm.currentUser._id)
            .then(() => {
                // remove like from local array
                vm.likes.splice(vm.likes.findIndex(x => x._id == vm.currentUser._id), 1);

                vm.isLiked = false;
            });
    }

    /**
     * Determines if current image is liked by current user
     * @returns {boolean}
     */
    function isLiked() {
        if (isAuthenticated()) {
            return vm.likes.find(x => x._id == vm.currentUser._id) !== undefined; // is the current user's id found in the 'likes' array?
        } else {
            return false;
        }
    }

    // Navigation, others --------------------------

    /**
     * The function responsible for navigating the user between images in the gallery when using the keyboard.
     * @param keyCode the code of the key that was pressed by the user
     */
    function navigate(keyCode) {
        if (vm.prev !== undefined && keyCode == 37) { // Go left (previous image)
            $state.go('user.gallery.image', {id: vm.prev, index: vm.index-1})
                .then(() => {
                    $scope.$hide();
                });
        } else if (vm.next !== undefined && keyCode == 39) { // Go right (next image)
            $state.go('user.gallery.image', {id: vm.next, index: vm.index+1})
                .then(() => {
                    $scope.$hide();
                });
        } else if (keyCode == 27) { // Escape (exit image view)
            $state.go('user.gallery', {user: vm.username})
                .then(() => {
                    $scope.$hide();
                });
        }
    }

    /**
     * Hides the modal window.
     */
    function hide() {
        $scope.$hide();
    }

    /**
     * Updates the image title and reloads the state.
     */
    function updateImageTitle() {
        ImageService.updateTitle(vm.user.username, $stateParams.id, vm.image.image.title)
            .then(() => {
                $state.reload();
                $scope.$hide();
            });
    }

    /**
     * The function to determine if the current user is authenticated.
     * @returns {*}
     */
    function isAuthenticated() {
        return $auth.isAuthenticated();
    }
}