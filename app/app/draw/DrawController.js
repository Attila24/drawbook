(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('DrawController', DrawController);

    DrawController.$inject = [];

    /* @ngInject */
    function DrawController() {
        var vm = this;
        vm.title = 'DrawController';
        
        
        
        
    }

    module.exports = DrawController;

})();

