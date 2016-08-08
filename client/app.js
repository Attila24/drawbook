'use strict';

import commonModule from './app/common/drawbook.common';
import userModule from './app/user/drawbook.user';

import DrawController from './app/draw/DrawController';
import UserService from './app/services/UserService';
import ImageService from './app/services/ImageService';
import CommentService from './app/services/CommentService';
import LikeService from './app/services/LikeService';
import BlurDirective from './app/directives/blur';

angular
    .module('drawbook', [
        'ngAnimate',
        'ui.router',
        'mgcrea.ngStrap',
        'satellizer',
        'LocalStorageModule',
        'ngFileUpload',
        'bsLoadingOverlay',
        'bsLoadingOverlayHttpInterceptor',
        commonModule.name,
        userModule.name
    ])
    .constant('server', {url: 'http://localhost:5000/api/'})
    .controller('DrawController', DrawController)

    // Services, factories
    .factory('UserService', UserService)
    .factory('ImageService', ImageService)
    .factory('CommentService', CommentService)
    .factory('LikeService', LikeService)

    // Directives
    .directive('blur', BlurDirective)

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
    }])

    .factory('allHttpInterceptor', bsLoadingOverlayHttpInterceptorFactoryFactory => bsLoadingOverlayHttpInterceptorFactoryFactory())
    .config(['$httpProvider', ($httpProvider) => {
        $httpProvider.interceptors.push('allHttpInterceptor');
    }])

    .run(bsLoadingOverlayService => {
        bsLoadingOverlayService.setGlobalConfig({
            delay: 500,
            activeClass: undefined,
            templateUrl: 'loading-overlay-template.html',
            templateOptions: undefined
        })
    });
