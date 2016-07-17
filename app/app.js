(function () {
    'use strict';

    angular
        .module('drawbook', [
            'ngAnimate',
            'ui.router',
            'mgcrea.ngStrap',
            'satellizer',
            'LocalStorageModule'
        ])
        .constant('server', require('./app.constants'))
        .factory('UserService', require('./app/services/UserService'))
        .factory('ImageService', require('./app/services/ImageService'))
        .config(require('./app.routes'))
        .config(require('./app.auth'));
})();