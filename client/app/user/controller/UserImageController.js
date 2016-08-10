'use strict';

UserImageController.$inject = ['$stateParams', 'ImageService', 'user', '$state', '$scope', 'CommentService', 'localStorageService', 'LikeService', '$q', 'UserService'];

/* @ngInject */
export default function UserImageController($stateParams, ImageService, user, $state, $scope, CommentService, localStorageService, LikeService, $q, UserService) {

    const vm = this;
    vm.title = 'UserImageController';
    vm.user = user.user;
    vm.index = $stateParams.index;
    vm.likes = [];

    vm.navigate = navigate;
    vm.addComment = addComment;
    vm.deleteComment = deleteComment;
    vm.likeOrDislike = likeOrDislike;
    vm.init = init;

    ////////////////////////////////////

    function init() {

        vm.isLiked = false;
        vm.currentUser = localStorageService.get('currentUser');
        loadLikes().then(result => {vm.isLiked = result;});

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

                if (res.data.status == 500 || res.data.status == 404){
                    $state.go('404');
                    $scope.$hide();
                }

                vm.image = res.data.data;
                vm.comments = vm.image.image.comments;
                loadAvatars();
            })
            .catch(function (res) {});
    }

    function loadAvatars() {
        for (let i = 0; i < vm.comments.length; i++) {
            UserService.getAvatarPath(vm.comments[i].author)
                .then(data => {
                        vm.comments[i].removedAuthor = vm.comments[i].authorTimestamp < data.timestamp;
                        vm.comments[i].authorAvatar = data == null ? 'img/default-avatar.jpg' : data.avatarPath;
                    }
                )
        }
    }

    function loadComments() {
        CommentService.get(vm.user.username, $stateParams.id)
            .then(function (res) {
                vm.comments = res.image.comments;
                loadAvatars();
            })
            .catch(function (res) {});
    }

    function loadLikes() {
        let d = $q.defer();
        LikeService.get(vm.user.username, $stateParams.id)
            .then(data => {
                vm.likes = [];
                for (let i = 0; i < data.likes.length; i++) {
                    UserService.getTimestamp(data.likes[i].author)
                        .then(res => {
                           if (res && data.likes[i].authorTimestamp == res.timestamp)
                               vm.likes.push(data.likes[i]);

                           if (i == data.likes.length-1)
                               d.resolve(isLiked());
                        });
                }
            })
            .catch(data=>{});
        return d.promise;
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

    function likeOrDislike() {
        vm.isLiked ? removeLike() : addLike();
    }

    function addLike() {

        LikeService.post(vm.user.username, $stateParams.id, vm.currentUser)
            .then(res=> {
                //vm.likes.push({author: vm.currentUser.username, authorTimestamp: vm.currentUser.timestamp});
                loadLikes();

                vm.isLiked = true;
            })
            .catch(res=> {});
    }
    
    function removeLike() {

        let id = vm.likes.find(x => x.authorTimestamp == vm.currentUser.timestamp)._id;

        LikeService.delete(vm.user.username, $stateParams.id, id)
            .then(res => {
                vm.likes.splice(vm.likes.findIndex(x => x.authorTimestamp == vm.currentUser.timestamp), 1);
                vm.isLiked = false;
            })
            .catch(res => {});
    }

    function isLiked() {

        return vm.likes.find(x => x.authorTimestamp == vm.currentUser.timestamp) != undefined;
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

}