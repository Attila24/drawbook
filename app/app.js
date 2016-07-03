(function () {
    'use strict';

    angular
        .module('paintr', [
            'ngAnimate',
            'ui.router',
            'mgcrea.ngStrap',
            'satellizer'
        ])
        .constant('server', require('./app.constants'))
        .factory('AuthService', require('./commons/services/AuthService'))
        .config(require('./app.routes'))
        .config(require('./app.auth'));
})();