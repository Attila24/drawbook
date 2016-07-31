(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('UserGalleryController', UserGalleryController);

    UserGalleryController.$inject = ['user', 'ImageService', '$state'];

    /* @ngInject */
    function UserGalleryController(user, ImageService, $state) {
        var vm = this;
        vm.title = 'UserGalleryController';
        vm.user = user.user;
        vm.images = [];

        const limit = 12;

        vm.loadMore = loadMore;

        init();

        ////////////////////

        function init(){
            vm.loaded = vm.user.images.length < limit ? vm.user.images.length : limit;
            for (var i = 0; i < vm.loaded; i++) {
                ImageService.get(vm.user.username, vm.user.images[i]._id)
                    .then(function (res) {
                        vm.images.push(res.data.data);
                    })
                    .catch(function (res) {});
            }
        }

        function loadMore() {
            vm.current = vm.loaded;
            vm.loaded = vm.user.images.length < vm.loaded + limit ? vm.user.images.length : vm.loaded + limit;

            console.log('current: ' + vm.current);
            console.log('loaded: ' + vm.loaded);

             for (var i = vm.current; i < vm.loaded; i++) {
                ImageService.get(vm.user.username, vm.user.images[i]._id)
                    .then(function (res) {
                        vm.images.push(res.data.data);
                    })
                    .catch(function (res) {});
            }
            console.log(vm.images);
        }



    }

    module.exports = UserGalleryController;

})();

