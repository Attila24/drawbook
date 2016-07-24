(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('UserGalleryController', UserGalleryController);

    UserGalleryController.$inject = ['$scope'];

    /* @ngInject */
    function UserGalleryController($scope) {
        var vm = this;
        vm.title = 'UserGalleryController';

        vm.images = $scope.vm.images;

    }

    module.exports = UserGalleryController;

})();

