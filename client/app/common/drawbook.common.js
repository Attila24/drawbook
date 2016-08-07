'use strict';

import HomeController from './controller/HomeController';
import LoginController from './controller/LoginController';
import RegisterController from './controller/RegisterController';
import ProfileEditController from './controller/ProfileEditController';

export default angular.module('drawbook.common', [])
        .controller(HomeController)
        .controller(LoginController)
        .controller(RegisterController)
        .controller(ProfileEditController)
        .config(['$stateProvider', ($stateProvider) => {
            $stateProvider.state('home', {
                url: '/',
                templateUrl: '/app/common/tpl/home.tpl.html',
                controller: HomeController,
                controllerAs: 'vm'
            }).
            state('register', {
                url: '/register',
                templateUrl: '/app/common/tpl/register.tpl.html',
                controller: RegisterController,
                controllerAs: 'vm'
            }).
            state('login', {
                url: '/login',
                templateUrl: '/app/common/tpl/login.tpl.html',
                controller: LoginController,
                controllerAs: 'vm'
            })
            .state('edit', {
                url: '/edit',
                templateUrl: '/app/common/tpl/profile-edit.tpl.html',
                controller: ProfileEditController,
                controllerAs: 'vm'
            });
        }]);