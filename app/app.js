(function () {
    'use strict';

    angular
        .module('drawbook', [
            'ngAnimate',
            'ui.router',
            'mgcrea.ngStrap',
            'satellizer'
        ])
        .constant('server', require('./app.constants'))
        .factory('UserService', require('./app/services/UserService'))
        .config(require('./app.routes'))
        .config(require('./app.auth'));
})();