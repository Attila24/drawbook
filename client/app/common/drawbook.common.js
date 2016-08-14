'use strict';

import HomeController from './controller/HomeController';
import LoginController from './controller/LoginController';
import RegisterController from './controller/RegisterController';
import ProfileEditController from './controller/ProfileEditController';
import MainController from './controller/MainController';

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
                controllerAs: 'vm'
            }).
            state('register', {
                url: '/register',
                parent: 'master',
                templateUrl: '/app/common/tpl/register.tpl.html',
                controller: RegisterController,
                controllerAs: 'vm'
            }).
            state('login', {
                url: '/login',
                parent: 'master',
                templateUrl: '/app/common/tpl/login.tpl.html',
                controller: LoginController,
                controllerAs: 'vm'
            })
            .state('edit', {
                url: '/edit',
                parent: 'master',
                templateUrl: '/app/common/tpl/profile-edit.tpl.html',
                controller: ProfileEditController,
                controllerAs: 'vm'
            });
        }]);