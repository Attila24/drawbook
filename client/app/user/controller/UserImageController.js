'use strict';

UserImageController.$inject = ['$stateParams', 'ImageService', 'user', '$state', '$scope', 'CommentService', 'localStorageService', 'LikeService', '$q', 'UserService', 'socket', '$auth'];

/* @ngInject */
export default function UserImageController($stateParams, ImageService, user, $state, $scope, CommentService, localStorageService, LikeService, $q, UserService, socket, $auth) {

    const vm = this;
    vm.title = 'UserImageController';
    vm.user = user.user;
    vm.index = $stateParams.index;
    vm.likes = [];
    vm.comments = [];

    vm.navigate = navigate;
    vm.loadComments = loadComments;
    vm.addComment = addComment;
    vm.deleteComment = deleteComment;
    vm.like = like;
    vm.dislike = dislike;
    vm.init = init;
    vm.isAuthenticated = isAuthenticated;

    ////////////////////////////////////

    function init() {

        vm.isLiked = false;
        vm.currentUser = localStorageService.get('currentUser');

        vm.loadedComments = 0;
        vm.commentLimit = 10;

        loadLikes().then(result => {vm.isLiked = result;});

        $(window).on('click', function(event) {
            if ($(event.target).is('.modal')) {
                $state.go('user.gallery', {user: vm.username})
                    .then(() => {
                        $scope.$hide();
                    });
            }
        });

        if (vm.index === undefined || vm.index === null) {
            vm.index = vm.user.images.map(e => e._id).indexOf($stateParams.id);
        }

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

        ImageService.get(vm.user.username, $stateParams.id, true)
            .then(res => {

                if (res.data.status == 500 || res.data.status == 404){
                    $state.go('404');
                    $scope.$hide();
                }

                vm.image = res.data.data;

                loadComments();
            })
            .catch(res => {});

        loadCommentCount();
    }

    ///////////////////////////////////////////////////////// comments

    function loadCommentCount() {
        CommentService.getCount(vm.user.username, $stateParams.id)
            .then(res => {
                vm.allComments = res;
            });
    }

    function loadComments() {
        CommentService.get(vm.user.username, $stateParams.id, vm.loadedComments, vm.commentLimit)
            .then(res => {
               vm.comments.unshift(...res.reverse());
               vm.loadedComments = vm.comments.length;
            })
            .catch(res => {});
    }



    function addComment() {
        CommentService.post(vm.user.username, $stateParams.id, vm.comment, vm.currentUser)
            .then(comment => {
                vm.loadedComments = 0;
                vm.commentLimit = vm.comments.length + 1;
                vm.allComments++;
                vm.comments = [];
                loadComments();
                if (vm.user._id != vm.currentUser._id) {
                    socket.emit('notification', {'to': vm.user._id, 'from': vm.currentUser._id, 'author': vm.currentUser.username, 'type': 'comment', imageid: $stateParams.id, 'comment': vm.comment});
                }
                vm.comment = "";
            })
            .catch(res => {});
    }

    function deleteComment(commentid) {
        CommentService.delete(vm.user.username, $stateParams.id, commentid)
            .then(res => {
                vm.loadedComments = 0;
                vm.commentLimit = vm.comments.length - 1;
                vm.allComments--;
                vm.comments = [];
                loadComments();
            })
            .catch(res => {});
    }


    /////////////////////////////////////////////////////// likes

    function loadLikes() {
        let d = $q.defer();
        LikeService.get(vm.user.username, $stateParams.id)
            .then(data => {
                vm.likes = data;
                d.resolve(isLiked());
            })
            .catch(data=>{});
        return d.promise;
    }

    function like() {
        LikeService.post(vm.user.username, $stateParams.id, vm.currentUser)
            .then(res => {
                loadLikes();
                vm.isLiked = true;
                if (vm.user._id != vm.currentUser._id) {
                    socket.emit('notification', {'to': vm.user._id, 'from': vm.currentUser._id, 'author': vm.currentUser.username, 'type': 'like', imageid: $stateParams.id});
                }
            })
            .catch(res => {});
    }
    
    function dislike() {
        LikeService.delete(vm.user.username, $stateParams.id, vm.currentUser._id)
            .then(res => {
                vm.likes.splice(vm.likes.findIndex(x => x._id == vm.currentUser._id), 1);
                vm.isLiked = false;
            })
            .catch(res => {});
    }

    function isLiked() {
        if (isAuthenticated()) {
            return vm.likes.find(x => x._id == vm.currentUser._id) !== undefined;
        } else {
            return false;
        }
    }


    //////////////////////////////// navigation

    function navigate(keyCode) {
        if (vm.prev !== undefined && keyCode == 37) { // left
            $state.go('user.gallery.image', {id: vm.prev, index: vm.index-1})
                .then(() => {
                    $scope.$hide();
                });
        } else if (vm.next !== undefined && keyCode == 39) { // right
            $state.go('user.gallery.image', {id: vm.next, index: vm.index+1})
                .then(() => {
                    $scope.$hide();
                });
        } else if (keyCode == 27) { // escape
            $state.go('user.gallery', {user: vm.username})
                .then(() => {
                    $scope.$hide();
                });
        }
    }

    function isAuthenticated() {
        return $auth.isAuthenticated();
    }
}