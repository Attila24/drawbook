'use strict';

UserGalleryController.$inject = ['user', 'ImageService', 'localStorageService', '$stateParams', '$state', 'LikeService', 'CommentService', '$q'];

/* @ngInject */
export default function UserGalleryController(user, ImageService, localStorageService, $stateParams, $state, LikeService, CommentService, $q) {
    const vm = this;
    vm.title = 'UserGalleryController';
    vm.user = user.user;
    vm.images = [];
    const limit = 12;

    vm.loadImages = loadImages;
    vm.deleteImage = deleteImage;

    init();

    ////////////////////

    function init(){
        if ($stateParams.openImage !== null && $stateParams.openImage !== undefined) {
            $state.go('user.gallery.image', {id: $stateParams.openImage, index: null});
        }

        vm.currentUser = localStorageService.get('currentUser');
        vm.loaded = 0;
        loadImages();
    }

    function loadImages() {
        ImageService.getMany(vm.user.username, vm.loaded, limit)
            .then(res => {
                let promises = [];

                angular.forEach(res.images, item => {
                   const likesPromise = LikeService.get(vm.user.username, item._id).then(data => {item.likes = data;});
                   const commentPromise = CommentService.getCount(vm.user.username, item._id).then(data => {item.commentCount = data;});
                   promises.push(likesPromise, commentPromise);
                });

                $q.all(promises).then(() => {
                    vm.images.push(...res.images);
                    vm.loaded = vm.images.length;
                });

            });
    }

    function deleteImage(id, index) {
        ImageService.delete(id, vm.user.username)
            .then(res => {vm.images.splice(index, 1);})
            .catch(res => {})
    }
}