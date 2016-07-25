(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('UserImageController', UserImageController);

    UserImageController.$inject = ['$stateParams', 'ImageService', 'UserService', 'username'];

    /* @ngInject */
    function UserImageController($stateParams, ImageService, UserService, username) {
        var vm = this;
        vm.title = 'UserImageController';

        init();

        ////////////////////////////////////

        function init() {
            vm.username = username;

            vm.index = $stateParams.index;

            ImageService.get(vm.username, $stateParams.id)
                .then(function (res) {
                    vm.image = {
                        data: 'data:image/png;base64,' + res.data.data,
                        id: res.id
                    };
                })
                .catch(function (res) {});

            UserService.get(vm.username)
                .then(function (res) {
                    vm.user = res.user;
                    /*console.log('index: ' + vm.index);

                     angular.forEach(vm.user.images, function (iter) {
                     console.log(iter._id);
                     });

                     console.log('current: ' + $stateParams.id);*/

                    if (vm.index != undefined && vm.index != null) {
                        if (vm.index == 0) {
                            vm.next = vm.user.images[vm.index+1]._id;
                            vm.prev = undefined;
                        } else if (vm.index > 0 && vm.index < vm.user.images.length-1) {
                            vm.prev = vm.user.images[vm.index-1]._id;
                            vm.next = vm.user.images[vm.index+1]._id;
                        } else if (vm.index == vm.user.images.length-1) {
                            vm.prev = vm.user.images[vm.index-1]._id;
                            vm.next = undefined;
                        }
                    }

                    /*console.log('prev:' + vm.prev);
                     console.log('next:' + vm.next);*/
                });

        }
    }

    module.exports = UserImageController;

})();

