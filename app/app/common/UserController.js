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

        vm.init = init;
        vm.deleteImage = deleteImage;

        init();

        ////////////////

        function init() {
            UserService.get($stateParams.username)
                .then(function (res) {
                    vm.user = res.user;
                })
                .catch(function (res) {});
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

