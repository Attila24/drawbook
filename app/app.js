(function () {
    'use strict';

    angular
        .module('drawbook', [
            'ngAnimate',
            'ui.router',
            'mgcrea.ngStrap',
            'satellizer',
            'LocalStorageModule',
            'ngFileUpload'
        ])
        .constant('server', require('./app.constants'))
        .factory('UserService', require('./app/services/UserService'))
        .factory('ImageService', require('./app/services/ImageService'))
        .factory('CommentService', require('./app/services/CommentService'))
        .config(require('./app.routes'))
        .config(require('./app.auth'));
})();