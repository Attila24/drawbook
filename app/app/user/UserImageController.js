(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('UserImageController', UserImageController);

    UserImageController.$inject = ['$stateParams', 'ImageService', 'user'];

    /* @ngInject */
    function UserImageController($stateParams, ImageService, user) {
        var vm = this;
        vm.title = 'UserImageController';
        vm.user = user.user;
        vm.index = $stateParams.index;

        init();

        ////////////////////////////////////

        function init() {

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
                })
                .catch(function (res) {});
        }
    }

    module.exports = UserImageController;

})();

