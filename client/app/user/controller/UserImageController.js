'use strict';

UserImageController.$inject = ['$stateParams', 'ImageService', 'user', '$state', '$scope', 'CommentService', 'localStorageService', 'LikeService'];

/* @ngInject */
export default function UserImageController($stateParams, ImageService, user, $state, $scope, CommentService, localStorageService, LikeService) {

    const vm = this;
    vm.title = 'UserImageController';
    vm.user = user.user;
    vm.index = $stateParams.index;
    vm.navigate = navigate;
    vm.addComment = addComment;
    vm.deleteComment = deleteComment;
    vm.addLike = addLike;
    vm.removeLike = removeLike;
    vm.isLiked = isLiked;

    vm.likes = [];

    init();

    ////////////////////////////////////

    function init() {

        vm.currentUser = localStorageService.get('currentUser');

        $(window).on('click', function(event) {
            if ($(event.target).is('.modal')) {
                $state.go('user.gallery', {user: vm.username})
                    .then(function() {
                        $scope.$hide();
                    });
            }
        });

        if (vm.index === undefined || vm.index === null) {
            vm.index = vm.user.images.map(function (e) {return e._id}).indexOf($stateParams.id);
        }

        if (vm.user.images.length == 1) {
            vm.prev = vm.next = undefined;
        } else if (vm.index == 0) {
            vm.next = vm.user.images[vm.index+1]._id;
            vm.prev = undefined;
        } else if (vm.index > 0 && vm.index < vm.user.images.length-1) {
            vm.prev = vm.user.images[vm.index-1]._id;
            vm.next = vm.user.images[vm.index+1]._id;
        } else if (vm.index == vm.user.images.length-1) {
            vm.prev = vm.user.images[vm.index-1]._id;
            vm.next = undefined;
        }

        ImageService.get(vm.user.username, $stateParams.id)
            .then(function (res) {
                vm.image = res.data.data;
                vm.comments = vm.image.image.comments;
            })
            .catch(function (res) {});
        loadLikes();
    }

    function loadComments() {
        CommentService.get(vm.user.username, $stateParams.id)
            .then(function (res) {
                vm.comments = res.image.comments;
            })
            .catch(function (res) {});
    }

    function loadLikes() {
        LikeService.get(vm.user.username, $stateParams.id)
            .then(res => {
                vm.likes = res.likes;
            })
            .catch(res=>{});
    }

    function navigate(keyCode) {
        if (vm.prev != undefined && keyCode == 37) { // left
            $state.go('user.gallery.image', {id: vm.prev, index: vm.index-1})
                .then(function() {
                    $scope.$hide();
                });
        } else if (vm.next != undefined && keyCode == 39) { // right
            $state.go('user.gallery.image', {id: vm.next, index: vm.index+1})
                .then(function() {
                    $scope.$hide();
                });
        } else if (keyCode == 27) { // escape
            $state.go('user.gallery', {user: vm.username})
                .then(function() {
                    $scope.$hide();
                });
        }
    }


    function addComment() {
        CommentService.post(vm.user.username, $stateParams.id, vm.comment, vm.currentUser)
            .then(function (res) {
                vm.comment = "";
                loadComments();
            })
            .catch(function (res) {});
    }

    function deleteComment(commentid) {
        CommentService.delete(vm.user.username, $stateParams.id, commentid)
            .then(res => {
                loadComments();
            })
            .catch(res=>{});
    }

    function addLike() {
        LikeService.post(vm.user.username, $stateParams.id, vm.currentUser.username)
            .then(res=> {
                vm.likes.push(vm.currentUser.username);
            })
            .catch(res=> {});
    }
    
    function removeLike() {
        LikeService.delete(vm.user.username, $stateParams.id, vm.currentUser.username)
            .then(res => {
                vm.likes.splice(vm.likes.indexOf(vm.currentUser.username), 1);
            })
            .catch(res => {});
    }

    function isLiked() {
        return vm.likes.find(x => x == vm.currentUser.username) != undefined;
    }
}