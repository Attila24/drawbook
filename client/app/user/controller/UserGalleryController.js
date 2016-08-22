'use strict';

UserGalleryController.$inject = ['user', 'ImageService', 'localStorageService', '$stateParams', '$state', 'LikeService', 'CommentService', '$q', 'ConfirmService'];

/* @ngInject */
export default function UserGalleryController(user, ImageService, localStorageService, $stateParams, $state, LikeService, CommentService, $q, ConfirmService) {
    const vm = this;
    vm.title = 'UserGalleryController';
    vm.user = user.user;
    vm.images = [];
    const limit = 12;

    vm.loadImages = loadImages;
    vm.deleteImage = deleteImage;
    vm.tooltip = tooltip;

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

        ConfirmService.show().then(res => {
            if (res === 'yes') {
                ImageService.delete(id, vm.user.username)
                    .then(res => {vm.images.splice(index, 1);})
                    .catch(res => {})
            }
        });
    }

    function tooltip(index) {
        if (vm.images[index].likes.length > 0) {
            let str = '';
            const limit = 5;

            if (vm.images[index].likes.length <= limit) {
                str = vm.images[index].likes
                    .map(x => x.username)
                    .reduce((prev, curr) => prev + "<br />" + curr);
            } else {
                str = vm.images[index].likes.slice(0, limit)
                    .map(x => x.username)
                    .reduce((prev, curr) => prev + "<br />" + curr);

                str += "<br />" + (vm.images[index].likes.length - limit) + " more";
            }

            return {
                title: str
            }
        }
    }
}