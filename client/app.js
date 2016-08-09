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
        'angular-growl',
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
            })
            .state('404', {
                url: '/404',
                templateUrl: '/app/common/tpl/404.tpl.html'
            });
        $urlRouterProvider.otherwise("/404");
    }])

    // Auth config
    .config(['$authProvider', 'server', ($authProvider, server) => {
            $authProvider.baseUrl = server.url;
            $authProvider.signupUrl = '/users/register';
            $authProvider.loginUrl = '/users/login';
    }])

    .factory('allHttpInterceptor', bsLoadingOverlayHttpInterceptorFactoryFactory => bsLoadingOverlayHttpInterceptorFactoryFactory())
    .config(['$httpProvider', 'growlProvider', ($httpProvider, growlProvider) => {

        growlProvider.globalTimeToLive(5000);

        $httpProvider.interceptors.push(growlProvider.serverMessagesInterceptor);
        $httpProvider.interceptors.push('allHttpInterceptor');
    }])

    .run(bsLoadingOverlayService => {
        bsLoadingOverlayService.setGlobalConfig({
            delay: 400,
            activeClass: undefined,
            templateUrl: './app/common/tpl/loading-overlay-template.html',
            templateOptions: undefined
        })
    });
