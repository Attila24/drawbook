(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('UserController', UserController);

    UserController.$inject = ['$stateParams', 'UserService', 'ImageService'];

    /* @ngInject */
    function UserController($stateParams, UserService, ImageService) {
        var vm = this;
        vm.title = 'UserController';
        vm.images = [];

        vm.init = init;
        vm.deleteImage = deleteImage;

        init();


        ////////////////

        function init() {
            UserService.get($stateParams.username)
                .then(function (res) {
                    vm.user = res.user;
                    loadImages(vm.user.images);
                })
                .catch(function (res) {});
        }

        function loadImages(images) {
            for (var i = 0; i < images.length; i++) {
                ImageService.get(vm.user.username, images[i]._id)
                    .then(function (res) {
                        vm.images.push({
                            data: 'data:image/png;base64,' + res.data.data,
                            id: res.id
                        });
                    })
                    .catch(function (res) {});
            }
        }

        function deleteImage(_id, index) {
            ImageService.delete(_id, vm.user.username)
                .then(function (res){
                    delete vm.user.images[index];
                })
                .catch(function (res){});
        }
    }

    module.exports = UserController;

})();

