'use strict';

import HomeController from './app/common/HomeController';
import LoginController from './app/common/LoginController';

DrawboookStates.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

/* @ngInject */
export default function DrawboookStates ($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider.state('home', {
            url: '/',
            templateUrl: '/app/common/home.tpl.html',
            controller: HomeController,
            controllerAs: 'vm'
        }).
        state('register', {
            url: '/register',
            templateUrl: '/app/common/register.tpl.html',
            controller: require('./app/common/RegisterController'),
            controllerAs: 'vm'
        }).
        state('login', {
            url: '/login',
            templateUrl: '/app/common/login.tpl.html',
            controller: LoginController,
            controllerAs: 'vm'
        })
        .state('draw', {
            url: '/draw',
            templateUrl: '/app/draw/draw.tpl.html',
            controller: require('./app/draw/DrawController'),
            controllerAs: 'vm'
        })
        .state('edit', {
            url: '/edit',
            templateUrl: '/app/common/profile-edit.tpl.html',
            controller: require('./app/common/ProfileEditController'),
            controllerAs: 'vm'
        })
        .state('user', {
            abstract: true,
            url: '/:username',
            templateUrl: '/app/user/user.tpl.html',
            controller: require('./app/user/UserController'),
            controllerAs: 'vm',
            resolve: {
                user: ['$stateParams', 'UserService', ($stateParams, UserService) => UserService.get($stateParams.username)
                ]
            }
        })
        .state('user.gallery', {
            url: '/',
            templateUrl: '/app/user/user.gallery.tpl.html',
            controller: require('./app/user/UserGalleryController'),
            controllerAs: 'vm'
        })
        .state('user.gallery.image', {
            url: 'image/:id',
            params: {index: null},
            onEnter: ['$modal', '$state', 'user', '$stateParams', ($modal, $state, user) => {
                $modal({
                    templateUrl: '/app/user/user.image.tpl.html',
                    controller: require('./app/user/UserImageController'),
                    controllerAs: 'vm',
                    resolve: {
                        user: () => user
                    },
                    container: 'body',
                    animation: 'am-fade',
                    backdropAnimation: 'backdrop-anim',
                    position: 'center',
                    keyboard: false,
                    backdrop: false
                });
            }]
        });

    $urlRouterProvider.otherwise("/");
    $locationProvider.html5Mode(true);
}