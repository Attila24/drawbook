'use strict';

import commonModule from './app/common/drawbook.common';
import userModule from './app/user/drawbook.user';

import DrawController from './app/draw/DrawController';
import UserService from './app/services/UserService';
import ImageService from './app/services/ImageService';
import CommentService from './app/services/CommentService';

angular
    .module('drawbook', [
        'ngAnimate',
        'ui.router',
        'mgcrea.ngStrap',
        'satellizer',
        'LocalStorageModule',
        'ngFileUpload',
        commonModule.name,
        userModule.name
    ])
    .constant('server', {url: 'http://localhost:5000/api/'})
    .controller('DrawController', DrawController)

    // Services, factories
    .factory('UserService', UserService)
    .factory('ImageService', ImageService)
    .factory('CommentService', CommentService)
    // Routes config
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', ($stateProvider, $urlRouterProvider, $locationProvider) => {
        $locationProvider.html5Mode(true);
        $stateProvider
            .state('draw', {
                    url: '/draw',
                    templateUrl: '/app/draw/draw.tpl.html',
                    controller: DrawController,
                    controllerAs: 'vm'
            });
        $urlRouterProvider.otherwise("/");
    }])

    // Auth config
    .config(['$authProvider', 'server', ($authProvider, server) => {
            $authProvider.baseUrl = server.url;
            $authProvider.signupUrl = '/users/register';
            $authProvider.loginUrl = '/users/login';
    }]);
