'use strict';

import HomeController from './controller/HomeController';
import LoginController from './controller/LoginController';
import RegisterController from './controller/RegisterController';
import ProfileEditController from './controller/ProfileEditController';
import MainController from './controller/MainController';
import UsersController from './controller/UsersController';

export default angular.module('drawbook.common', [])
        .controller(HomeController)
        .controller(LoginController)
        .controller(RegisterController)
        .controller(ProfileEditController)
        .controller(MainController)
        .config(['$stateProvider', ($stateProvider) => {
            $stateProvider
            .state('master', {
                abstract: true,
                views: {
                    'main': {
                        templateUrl: '/app/common/tpl/main.tpl.html',
                        controller: MainController,
                        controllerAs: 'vm'
                    }
                }
            })
            .state('home', {
                url: '/',
                parent: 'master',
                templateUrl: '/app/common/tpl/home.tpl.html',
                controller: HomeController,
                controllerAs: 'vm',
                resolve: {
                    currentUser: ['localStorageService', (localStorageService) => localStorageService.get('currentUser')]
                },
                onEnter: ['$window', ($window) => {$window.document.title = 'Drawbook';}]
            }).
            state('register', {
                url: '/register',
                parent: 'master',
                templateUrl: '/app/common/tpl/register.tpl.html',
                controller: RegisterController,
                controllerAs: 'vm',
                onEnter: ['$window', ($window) => {$window.document.title = 'Drawbook - Register';}]
            }).
            state('login', {
                url: '/login',
                parent: 'master',
                templateUrl: '/app/common/tpl/login.tpl.html',
                controller: LoginController,
                controllerAs: 'vm',
                onEnter: ['$window', ($window) => {$window.document.title = 'Drawbook - Login';}]
            })
            .state('edit', {
                url: '/edit',
                parent: 'master',
                templateUrl: '/app/common/tpl/profile-edit.tpl.html',
                controller: ProfileEditController,
                controllerAs: 'vm',
                onEnter: ['$window', ($window) => {$window.document.title = 'Drawbook - Edit Profile';}]
            })
            .state('users', {
              url: '/users',
              parent: 'master',
              params: {searchInput: null},
              templateUrl: '/app/common/tpl/users.tpl.html',
              controller: UsersController,
              controllerAs: 'vm',
              onEnter: ['$window', ($window) => {$window.document.title = 'Drawbook - Users';}]
            });
        }]);