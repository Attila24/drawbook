(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('UserImageController', UserImageController);

    UserImageController.$inject = ['$stateParams', 'ImageService', 'username'];

    /* @ngInject */
    function UserImageController($stateParams, ImageService, username) {
        var vm = this;
        vm.title = 'UserImageController';

        init();

        ////////////////////////////////////

        function init() {
            vm.username = username;
            vm.prev = $stateParams.prev;
            vm.next = $stateParams.next;
            console.log(vm.prev, vm.next);
            ImageService.get(vm.username, $stateParams.id)
                .then(function (res) {
                    vm.image = {
                       data: 'data:image/png;base64,' + res.data.data,
                       id: res.id
                   };
                })
                .catch(function (res) {});
        }
    }

    module.exports = UserImageController;

})();

