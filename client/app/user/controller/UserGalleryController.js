'use strict';

UserGalleryController.$inject = ['user', 'ImageService', 'localStorageService', '$stateParams', '$state'];

/* @ngInject */
export default function UserGalleryController(user, ImageService, localStorageService, $stateParams, $state) {
    const vm = this;
    vm.title = 'UserGalleryController';
    vm.user = user.user;
    vm.images = [];

    const limit = 12;

    vm.loadMore = loadMore;
    vm.deleteImage = deleteImage;

    init();

    ////////////////////

    function init(){
        if ($stateParams.openImage !== null && $stateParams.openImage !== undefined) {
            $state.go('user.gallery.image', {id: $stateParams.openImage, index: null});
        }

        vm.currentUser = localStorageService.get('currentUser');

        vm.loaded = vm.user.images.length < limit ? vm.user.images.length : limit;
        for (var i = 0; i < vm.loaded; i++) {
            ImageService.get(vm.user.username, vm.user.images[i]._id)
                .then(res => {
                    vm.images.push(res.data.data);
                })
                .catch(function (res) {});
        }
    }

    function loadMore() {
        vm.current = vm.loaded;
        vm.loaded = vm.user.images.length < vm.loaded + limit ? vm.user.images.length : vm.loaded + limit;

         for (var i = vm.current; i < vm.loaded; i++) {
            ImageService.get(vm.user.username, vm.user.images[i]._id)
                .then(function (res) {
                    vm.images.push(res.data.data);
                })
                .catch(function (res) {});
        }
    }

    function deleteImage(id, index) {
        console.log('images:' + vm.images);
        console.log(index);
        ImageService.delete(id, vm.user.username)
            .then(res => {vm.images.splice(index, 1);})
            .catch(res => {})
    }
}