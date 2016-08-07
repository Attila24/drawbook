'use strict';

UserController.$inject = ['$stateParams', 'UserService', 'ImageService', 'user'];

/* @ngInject */
export default function UserController($stateParams, UserService, ImageService, user) {
    var vm = this;
    vm.title = 'UserController';
    vm.images = [];
    vm.user = user.user;

    ////////////////

    /*function deleteImage(_id, index) {
        ImageService.delete(_id, vm.user.username)
            .then(function (res){
                delete vm.user.images[index];
            })
            .catch(function (res){});
    }*/
}



